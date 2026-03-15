base toi sur ce sql : -- supabase/schemas/events.sql
-- Declarative schema for Masterclasses / Exposants / Visiteurs / Registrations

-- 1) Create tables

-- Masterclasses: primary key is the code used by front-end (e.g. "jour1-1130-entrepreneuriat")
create table if not exists "masterclasses" (
  "code" text primary key,
  "title" text not null,
  "description" text,
  -- day could be a date or an enum like 'jour1' - use date if you store calendar dates
  "day" date,
  "time" time without time zone,
  "room" text,
  "capacity" integer not null check (capacity > 0),
  "created_at" timestamptz default now()
);

-- Exposants (exhibitors)
create table if not exists "exhibitors" (
  "id" bigint generated always as identity primary key,
  "firstname" varchar(255) not null,
  "lastname" varchar(255) not null,
  "secteur" text,
  "name" varchar(255) not null,
  "description" text not null,
  "email" varchar(320),
  "phone" varchar(25),
  "area" int,
  "ville" text,
  "created_at" timestamptz default now()
);

-- Donations 
create table if not exists "donations" (
    "id" uuid default gen_random_uuid() primary key,
    "first_name" varchar(255) not null,
    "last_name" varchar(255) not null,
    "email" varchar(320),
    "phone" varchar(25),
    "price" numeric, 
    "association" text,
    "commentaire" text, 
    "anonyme" boolean,
  "created_at" timestamptz default now()
    
 
);
-- Visiteurs (visitors). Use uuid to easily relate to auth.users if needed.
create table if not exists "visitors" (
  "id" uuid default gen_random_uuid() primary key,
  "first_name" varchar(255) not null,
  "last_name" varchar(255) not null,
  "email" varchar(320),
  "phone" varchar(25),
  "created_at" timestamptz default now()
);

-- Registrations between masterclass and visiteur
create table if not exists "masterclass_registrations" (
  "id" bigint generated always as identity primary key,
  "masterclass_code" text not null references "masterclasses"("code") on delete cascade,
  "visitors_id" uuid not null references "visitors"("id") on delete cascade,
  "registered_at" timestamptz default now(),
  constraint masterclass_visitors_unique unique ("masterclass_code", "visitors_id")
);

-- 2) Indexes (helpful for lookups)
create index if not exists idx_masterclasses_day_time on "masterclasses" ("day", "time");
create index if not exists idx_exhibitors_ville on "exhibitors" ("ville");
create index if not exists idx_visitors_email on "visitors" ("email");
create index if not exists idx_mr_masterclass on "masterclass_registrations" ("masterclass_code");
create index if not exists idx_mr_visitors on "masterclass_registrations" ("visitors_id");

-- 3) Enable RLS (optional but recommended for public API safety)
-- You can remove or adjust these if you don't want RLS enabled by default.

alter table "visitors" enable row level security;
alter table "masterclass_registrations" enable row level security;

-- Minimal RLS policies:
-- Allow authenticated users to insert a visitor row for themselves (if you set visitor.id = auth.uid())
-- Here we assume visitors are separate from auth.users; adjust policies if linking to auth.users is desired.

-- Allow authenticated users to insert visiteurs (they create their own record)
create policy "visitors_insert_authenticated" on "visitors"
  for insert
  to authenticated
  with check (true);

-- Allow authenticated users to select their own visitor row by matching email OR id if you set request.jwt.claims.sub
create policy "visitors_select_own_by_email_or_id" on "visitors"
  for select
  to authenticated
  using (
    (
      -- if frontend includes user's email in the JWT claims (rare), match by email
      (current_setting('request.jwt.claims', true)::json ->> 'email') is not null
      and email is not null
      and email = (current_setting('request.jwt.claims', true)::json ->> 'email')
    )
    OR
    (
      -- match by sub claim if you set visiteur.id to auth.uid()
      (select auth.uid()) = id
    )
  );

-- Allow authenticated users to insert registrations (they register themselves)
create policy "registrations_insert_authenticated" on "masterclass_registrations"
  for insert
  to authenticated
  with check (
    -- ensure the referenced masterclass exists (FK already enforces) and that
    -- if visiteur_id is set to auth.uid() it matches, otherwise allow apps to pass a visiteur_id
    true
  );

-- Allow authenticated users to view their registrations (match visiteur_id against auth.uid() if you use auth.uid())
create policy "registrations_select_own" on "masterclass_registrations"
  for select
  to authenticated
  using (
    (select auth.uid()) = visitors_id
    OR
    -- or check if JWT contains email and match via visitor email (if your flow stores visitor.email in jwt)
    (current_setting('request.jwt.claims', true)::json ->> 'email') is not null
      and exists (
        select 1 from visitors v
        where v.id = visitors_id
          and v.email = (current_setting('request.jwt.claims', true)::json ->> 'email')
      )
  );

-- 4) Seed masterclasses by code with capacities
-- NOTE: Declarative schema files are DDL-only in the schema folder; seeding data is often done in supabase/seed.sql.
-- However, small seeds are acceptable if you want them included here. If you prefer seeds to live in supabase/seed.sql, move the inserts there.
-- Update the list below to match the exact codes used by your front-end and desired capacities (100 or 50).
 -- ============================================
-- SEED DATA FOR FOIRE CONGOLAISE
-- ============================================

-- Optional cleanup
truncate table masterclass_registrations cascade;
truncate table visitors cascade;
truncate table exhibitors cascade;
truncate table donations cascade;
truncate table masterclasses cascade;


-- ============================================
-- MASTERCLASSES (Foire Congolaise)
-- ============================================

insert into masterclasses
(code, title, description, day, time, room, capacity)
values

(
'jour1-1000-entrepreneuriat-rdc',
'Entreprendre en RDC',
'Comment créer et développer un business rentable en République Démocratique du Congo',
'2026-08-15',
'10:00',
'Salle Lumumba',
100
),

(
'jour1-1130-agriculture',
'Investir dans l’agriculture congolaise',
'Opportunités et défis dans le secteur agricole en RDC',
'2026-08-15',
'11:30',
'Salle Kasa-Vubu',
100
),

(
'jour1-1400-fintech',
'Fintech et Mobile Money en Afrique',
'Le rôle de la fintech dans le développement économique africain',
'2026-08-15',
'14:00',
'Salle Mobutu',
50
),

(
'jour1-1600-diaspora',
'Investir depuis la diaspora',
'Comment la diaspora peut investir efficacement en RDC',
'2026-08-15',
'16:00',
'Salle Lumumba',
100
),

(
'jour2-1000-startup',
'Créer une startup technologique en Afrique',
'Guide complet pour lancer une startup tech en RDC',
'2026-08-16',
'10:00',
'Salle Mobutu',
50
),

(
'jour2-1130-innovation',
'Innovation et transformation digitale',
'Comment la technologie transforme les entreprises africaines',
'2026-08-16',
'11:30',
'Salle Lumumba',
100
),

(
'jour2-1400-marketing',
'Marketing digital en Afrique',
'Stratégies marketing adaptées au marché africain',
'2026-08-16',
'14:00',
'Salle Kasa-Vubu',
100
),

(
'jour2-1600-funding',
'Comment lever des fonds pour son projet',
'Convaincre investisseurs et business angels',
'2026-08-16',
'16:00',
'Salle Mobutu',
50
)

on conflict (code) do nothing;


-- ============================================
-- EXHIBITORS (Entreprises Congolaises)
-- ============================================

insert into exhibitors
(firstname, lastname, secteur, name, description, email, phone, area, ville)
values

(
'Jean',
'Mbemba',
'Technologie',
'CongoTech',
'Solutions numériques et développement logiciel',
'contact@congotech.cd',
'+243810000001',
12,
'Kinshasa'
),

(
'Grâce',
'Ilunga',
'Agriculture',
'AgriCongo',
'Production et transformation agricole',
'contact@agricongo.cd',
'+243810000002',
14,
'Lubumbashi'
),

(
'Patrick',
'Tshibanda',
'Fintech',
'CongoPay',
'Solution de paiement mobile',
'contact@congopay.cd',
'+243810000003',
18,
'Kinshasa'
),

(
'Nadine',
'Mutombo',
'Mode',
'Mode Congo',
'Création et vente de vêtements africains',
'contact@modecongo.cd',
'+243810000004',
20,
'Goma'
),

(
'Alain',
'Kasongo',
'Education',
'EduCongo',
'Plateforme éducative numérique',
'contact@educongo.cd',
'+243810000005',
22,
'Kinshasa'
);


-- ============================================
-- VISITORS (Participants)
-- ============================================

insert into visitors
(id, first_name, last_name, email, phone)
values

(
gen_random_uuid(),
'Christian',
'Mukendi',
'christian.mukendi@email.com',
'+243820000001'
),

(
gen_random_uuid(),
'Ruth',
'Banza',
'ruth.banza@email.com',
'+243820000002'
),

(
gen_random_uuid(),
'David',
'Kalala',
'david.kalala@email.com',
'+243820000003'
),

(
gen_random_uuid(),
'Esther',
'Mbuyi',
'esther.mbuyi@email.com',
'+243820000004'
),

(
gen_random_uuid(),
'Samuel',
'Kabongo',
'samuel.kabongo@email.com',
'+243820000005'
);


-- ============================================
-- DONATIONS
-- ============================================

insert into donations
(first_name, last_name, email, phone, price, association, commentaire, anonyme)
values

(
'Michel',
'Lukusa',
'michel@email.com',
'+243830000001',
50,
'Association Enfants du Congo',
'Soutien pour les enfants',
false
),

(
'Claudine',
'Mpoyo',
'claudine@email.com',
'+243830000002',
100,
'Fondation Education Congo',
'Bonne initiative',
false
),

(
'Patrick',
'Kanku',
'patrick@email.com',
'+243830000003',
25,
'Association Santé Congo',
'Bon courage',
true
);


-- ============================================
-- REGISTRATIONS
-- ============================================

insert into masterclass_registrations
(masterclass_code, visitors_id)
select
m.code,
v.id
from masterclasses m
join visitors v on true
limit 12

on conflict do nothing;