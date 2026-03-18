/* =====================================================
   ficcon.js — Script principal du site FICCON
   ===================================================== */

   const API_BASE = 'https://ficcon-website.onrender.com';

   /* ===== NAVBAR : effet scroll ===== */
   const navbar = document.getElementById('navbar');
   window.addEventListener('scroll', () => {
     navbar.classList.toggle('scrolled', window.scrollY > 50);
   });
   
   /* ===== MENU MOBILE ===== */
   function toggleMenu() {
     document.getElementById('mobileMenu').classList.toggle('open');
   }
   function closeMobile() {
     document.getElementById('mobileMenu').classList.remove('open');
   }
   
   /* ===== TABS : Exposants ===== */
   function switchTab(tabId) {
     document.querySelectorAll('.exposants-tabs .tab-btn').forEach((btn, i) => {
       btn.classList.toggle('active', (i === 0 && tabId === 'nos-exposants') || (i === 1 && tabId === 'devenir-exposant'));
     });
     document.getElementById('tab-nos-exposants').classList.toggle('active', tabId === 'nos-exposants');
     document.getElementById('tab-devenir-exposant').classList.toggle('active', tabId === 'devenir-exposant');
     document.querySelector('#exposants').scrollIntoView({ behavior: 'smooth' });
   }
   
   document.querySelectorAll('.exposants-tabs .tab-btn').forEach((btn, i) => {
     btn.addEventListener('click', () => switchTab(i === 0 ? 'nos-exposants' : 'devenir-exposant'));
   });
   
   /* ===== TABS : Infos pratiques ===== */
   function switchInfoTab(tabId) {
     const tabs = ['acces', 'faq'];
     document.querySelectorAll('.infos-tabs-wrapper .tab-btn').forEach((btn, i) => {
       btn.classList.toggle('active', tabs[i] === tabId);
     });
     tabs.forEach(t => {
       const el = document.getElementById('info-tab-' + t);
       if (el) el.classList.toggle('active', t === tabId);
     });
   }
   
   document.querySelectorAll('.infos-tabs-wrapper .tab-btn').forEach((btn, i) => {
     const tabs = ['acces', 'faq'];
     btn.addEventListener('click', () => switchInfoTab(tabs[i]));
   });
   
   /* ===== MODAL : Donation ===== */
   function openModal() {
     document.getElementById('modalTitle').textContent = 'Faire un don';
     document.getElementById('modalPrice').textContent = 'Montant libre — 100% reversé à Team Congo ou FONAREV';
     document.getElementById('billetModal').classList.add('open');
     document.getElementById('billetSuccess').style.display = 'none';
   }
   function closeModal() {
     document.getElementById('billetModal').classList.remove('open');
   }
   document.getElementById('billetModal').addEventListener('click', function(e) {
     if (e.target === this) closeModal();
   });
   
   /* ===== MODAL : Masterclass ===== */
   function openMasterclassForm(eventId) {
     const eventEl = document.querySelector('.prog-event[data-event-id="' + eventId + '"]');
     if (!eventEl) return;
     const title = eventEl.querySelector('.prog-event-info strong')?.textContent || '';
     const time = eventEl.querySelector('.prog-time')?.textContent || '';
     document.getElementById('mcEventTitle').textContent = title;
     document.getElementById('mcEventTime').textContent = time;
     document.getElementById('mcEventHidden').value = eventId;
     document.getElementById('masterclassModal').classList.add('open');
     document.getElementById('masterclassSuccess').style.display = 'none';
   }
   function closeMasterclassModal() {
     document.getElementById('masterclassModal').classList.remove('open');
   }
   document.getElementById('masterclassModal').addEventListener('click', function(e) {
     if (e.target === this) closeMasterclassModal();
   });
   
   /* ===== FORMULAIRE : Contact ===== */
   async function submitContactForm() {
     const form = document.getElementById('contactForm');
     const data = Object.fromEntries(new FormData(form));
   
     try {
       const res = await fetch(`${API_BASE}/api/emails/contact`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
   
       if (!res.ok) {
         const err = await res.json().catch(() => ({}));
         alert('Erreur lors de l\'envoi : ' + (err.error || res.statusText));
         return;
       }
   
       const success = document.getElementById('contactSuccess');
       success.style.display = 'block';
       form.reset();
       setTimeout(() => { success.style.display = 'none'; }, 5000);
     } catch (e) {
       console.error(e);
       alert('Erreur réseau, merci de réessayer.');
     }
   }
   
   /* ===== FORMULAIRE : Devenir exposant ===== */
   async function submitExposantForm() {
     const form = document.getElementById('exposantForm');
     const data = Object.fromEntries(new FormData(form));
   
     try {
       const res = await fetch(`${API_BASE}/api/emails/exposant`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
   
       if (!res.ok) {
         const err = await res.json().catch(() => ({}));
         alert('Erreur lors de l\'envoi : ' + (err.error || res.statusText));
         return;
       }
   
       const success = document.getElementById('exposantSuccess');
       success.style.display = 'block';
       form.reset();
       setTimeout(() => { success.style.display = 'none'; }, 5000);
     } catch (e) {
       console.error(e);
       alert('Erreur réseau, merci de réessayer.');
     }
   }
   
   /* ===== FORMULAIRE : Donation (Stripe) ===== */
   async function submitBilletForm() {
     const form = document.getElementById('billetForm');
     const data = Object.fromEntries(new FormData(form));
   
     if (!data.montant || Number(data.montant) <= 0) {
       alert('Merci de saisir un montant de don valide.');
       return;
     }
   
     // Mémorisation pour l'email de remerciement post-redirection Stripe
     sessionStorage.setItem('lastDonation', JSON.stringify({
       prenom: data.prenom,
       nom: data.nom,
       email: data.email,
       montant: data.montant,
       association: data.association,
       commentaire: data.commentaire || '',
       anonyme: !!data.anonyme
     }));
   
     try {
       const res = await fetch(`${API_BASE}/api/donations/checkout`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
   
       if (!res.ok) {
         const err = await res.json().catch(() => ({}));
         alert('Erreur lors de la création du paiement : ' + (err.error || res.statusText));
         return;
       }
   
       const body = await res.json();
       if (body.url) {
         window.location.href = body.url;
       } else {
         alert('Réponse Stripe invalide.');
       }
     } catch (e) {
       console.error(e);
       alert('Erreur réseau, merci de réessayer.');
     }
   }
   
   /* ===== FORMULAIRE : Inscription masterclass ===== */
   async function submitMasterclassForm() {
     const form = document.getElementById('masterclassForm');
     const data = Object.fromEntries(new FormData(form));
     const eventId = data.event_id;
   
     try {
       const res = await fetch(`${API_BASE}/api/masterclasses/${encodeURIComponent(eventId)}/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           first_name: data.prenom,
           last_name: data.nom,
           email: data.email,
           phone: data.telephone || null
         })
       });
   
       if (!res.ok) {
         const err = await res.json().catch(() => ({}));
         if (res.status === 409) {
           alert('Cette masterclass est complète.');
         } else {
           alert('Erreur lors de votre inscription : ' + (err.error || res.statusText));
         }
         return;
       }
   
       const body = await res.json();
   
       // Mise à jour du compteur de places dans l'UI
       const eventEl = document.querySelector('.prog-event[data-event-id="' + eventId + '"]');
       if (eventEl && body.remainingPlaces != null) {
         const remaining = body.remainingPlaces;
         const countEl = eventEl.querySelector('.prog-places-count');
         const placesEl = eventEl.querySelector('.prog-places');
         const btn = eventEl.querySelector('.btn-prog');
         if (countEl) countEl.textContent = remaining;
         if (placesEl) placesEl.classList.toggle('full', remaining <= 0);
         if (btn) {
           btn.disabled = remaining <= 0;
           btn.textContent = remaining <= 0 ? 'Complet' : "S'inscrire";
         }
       }
   
       // Email de confirmation via EmailJS
       emailjs.send('service_yfscpti', 'template_7h04f17', {
         from_name: data.prenom + ' ' + data.nom,
         from_email: data.email,
         subject: 'Confirmation inscription masterclass — ' + document.getElementById('mcEventTitle').textContent,
         message:
           'Vous êtes bien inscrit(e) à la masterclass : ' +
           document.getElementById('mcEventTitle').textContent +
           '\nHeure : ' + document.getElementById('mcEventTime').textContent +
           '\nTéléphone : ' + (data.telephone || 'Non renseigné'),
         form_type: 'Inscription masterclass'
       }).catch(e => console.error('EmailJS error:', e));
   
       document.getElementById('masterclassSuccess').style.display = 'block';
       form.reset();
       setTimeout(() => closeMasterclassModal(), 4000);
     } catch (e) {
       console.error(e);
       alert("Erreur réseau lors de l'inscription, merci de réessayer.");
     }
   }
   
   /* ===== EMAIL de remerciement après retour Stripe ===== */
   document.addEventListener('DOMContentLoaded', () => {
     const params = new URLSearchParams(window.location.search);
     if (params.get('donation') === 'success') {
       const raw = sessionStorage.getItem('lastDonation');
       if (raw) {
         const d = JSON.parse(raw);
         emailjs.send('service_yfscpti', 'template_7h04f17', {
           from_name: (d.prenom || '') + ' ' + (d.nom || ''),
           from_email: d.email,
           subject: 'Merci pour votre don à la FICCON',
           message:
             'Merci pour votre générosité !\n' +
             'Montant : ' + d.montant + '€\n' +
             'Association : ' + (d.association || '—') + '\n' +
             'Anonyme : ' + (d.anonyme ? 'Oui' : 'Non') + '\n\n' +
             'Message : ' + (d.commentaire || 'Aucun'),
           form_type: 'Donation Stripe'
         }).catch(e => console.error('EmailJS error:', e));
         sessionStorage.removeItem('lastDonation');
       }
   
       const success = document.getElementById('billetSuccess');
       if (success) success.style.display = 'block';
     }
   });
   
   /* ===== FAQ : accordéon ===== */
   function toggleFaq(btn) {
     const answer = btn.nextElementSibling;
     const isOpen = btn.classList.contains('open');
     document.querySelectorAll('.faq-question.open').forEach(q => {
       q.classList.remove('open');
       q.nextElementSibling.style.maxHeight = null;
     });
     if (!isOpen) {
       btn.classList.add('open');
       answer.style.maxHeight = answer.scrollHeight + 'px';
     }
   }
   
   /* ===== EXPOSANTS : chargement dynamique ===== */
   async function loadExhibitors() {
     const root = document.getElementById('exposants-carousel');
     if (!root) return;
   
     try {
       const res = await fetch(`${API_BASE}/api/exhibitors`);
       if (!res.ok) throw new Error('Erreur HTTP ' + res.status);
   
       const body = await res.json();
       const exhibitors = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
   
       if (!exhibitors.length) {
         root.innerHTML = '<p style="color:rgba(255,255,255,0.7);">Aucun exposant pour le moment.</p>';
         return;
       }
   
       const sectorClasses = {
         mode: 'badge-secteur-mode',
         gastronomie: 'badge-secteur-gastronomie',
         restauration: 'badge-secteur-gastronomie',
         art: 'badge-secteur-arts',
         artisanat: 'badge-secteur-arts',
         musique: 'badge-secteur-musique',
         entertainment: 'badge-secteur-musique',
         beauté: 'badge-secteur-beaute',
         cosmétique: 'badge-secteur-beaute',
         littérature: 'badge-secteur-litterature',
         édition: 'badge-secteur-litterature',
         tech: 'badge-secteur-tech',
         innovation: 'badge-secteur-tech',
       };
   
       root.innerHTML = exhibitors.slice(0, 15).map(ex => {
         const name = ex.name || 'Exposant';
         const secteur = ex.secteur || 'Exposant';
         const ville = ex.ville || '';
         const s = secteur.toLowerCase();
         const badgeClass = Object.entries(sectorClasses).find(([key]) => s.includes(key))?.[1] || 'badge-secteur-autre';
   
         return `
           <div class="exposant-card">
             <div class="exposant-logo" style="background: rgba(42,157,107,0.15); color: var(--green-light);">
               <span>${name.charAt(0).toUpperCase()}</span>
             </div>
             <h4>${name}</h4>
             <p>${secteur}${ville ? ' · ' + ville : ''}</p>
             <span class="exposant-badge ${badgeClass}">${secteur}</span>
           </div>
         `;
       }).join('');
     } catch (e) {
       console.error('Erreur chargement exposants', e);
       root.innerHTML = '<p style="color:rgba(255,255,255,0.7);">Nous attendons vos candidatures.</p>';
     }
   }
   
   /* ===== MASTERCLASS : chargement dynamique du programme ===== */
   async function loadMasterclassProgramme() {
     const root = document.getElementById('programme-masterclasses-root');
     if (!root) return;
   
     try {
       const res = await fetch(`${API_BASE}/api/masterclasses`);
       if (!res.ok) throw new Error('Erreur HTTP ' + res.status);
       const masterclasses = await res.json();
       renderMasterclassProgramme(masterclasses, root);
     } catch (e) {
       console.error('Erreur chargement masterclasses', e);
       root.innerHTML = '<p style="color:rgba(255,255,255,0.7);">Impossible de charger le programme pour le moment.</p>';
     }
   }
   
   function renderMasterclassProgramme(masterclasses, root) {
     if (!Array.isArray(masterclasses) || !masterclasses.length) {
       root.innerHTML = '<p style="color:rgba(255,255,255,0.7);">Aucune masterclass programmée pour le moment.</p>';
       return;
     }
   
     // Groupement par jour
     const byDay = {};
     masterclasses.forEach(mc => {
       const day = mc.day || 'Programme';
       if (!byDay[day]) byDay[day] = [];
       byDay[day].push(mc);
     });
   
     // Tri par heure dans chaque jour
     Object.values(byDay).forEach(list => list.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
   
     root.innerHTML = Object.entries(byDay).map(([dayLabel, list]) => `
       <div class="programme-day">
         <h4>${dayLabel}</h4>
         <div class="programme-events">
           ${list.map(mc => {
             const remaining = typeof mc.remainingPlaces === 'number' ? mc.remainingPlaces
               : (typeof mc.capacity === 'number' ? mc.capacity : '');
             const isFull = typeof remaining === 'number' && remaining <= 0;
             return `
               <div class="prog-event" data-event-id="${mc.code || ''}">
                 <div class="prog-time">${mc.time || ''}</div>
                 <div class="prog-event-info">
                   <strong>${mc.title || ''}</strong>
                   <p>${mc.room ? mc.room + ' · ' : ''}${mc.description || ''}</p>
                 </div>
                 <div class="prog-meta">
                   <span class="prog-places${isFull ? ' full' : ''}">
                     Places restantes : <span class="prog-places-count">${remaining !== '' ? remaining : ''}</span>
                   </span>
                   <button type="button" class="btn-prog"
                     onclick="openMasterclassForm('${mc.code || ''}')"
                     ${isFull ? 'disabled' : ''}>
                     ${isFull ? 'Complet' : "S'inscrire"}
                   </button>
                 </div>
               </div>
             `;
           }).join('')}
         </div>
       </div>
     `).join('');
   }
   
   /* ===== WEBSOCKET : refresh temps réel des places masterclass ===== */
   function connectRealtimeWS() {
     try {
       const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
       const ws = new WebSocket(`${protocol}//${window.location.hostname}:4000/ws`);
   
       ws.onmessage = (event) => {
         const msg = JSON.parse(event.data);
         if (msg.type === 'masterclass_update') loadMasterclassProgramme();
       };
   
       // Reconnexion automatique si la connexion est perdue
       ws.onclose = () => setTimeout(connectRealtimeWS, 5000);
     } catch (e) {
       console.error('Erreur connexion WS', e);
     }
   }
   
   /* ===== SCROLL REVEAL ===== */
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         entry.target.classList.add('visible');
         observer.unobserve(entry.target);
       }
     });
   }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
   
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));