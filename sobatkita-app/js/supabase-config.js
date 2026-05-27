import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// GANTI DENGAN KREDENSIAL SUPABASE ANDA
const supabaseUrl = 'https://URL_SUPABASE_ANDA.supabase.co'
const supabaseKey = 'ANON_KEY_ANDA'

export const supabase = createClient(supabaseUrl, supabaseKey)
