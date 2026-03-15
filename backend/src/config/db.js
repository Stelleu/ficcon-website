import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()


const SUPABASE_URL = "https://wpyxjrakfusdbjtbvweq.supabase.co"
const supabase = createClient(
  SUPABASE_URL, 
  process.env.SERVICE_KEY
);
export default supabase;
