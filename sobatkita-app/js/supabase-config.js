import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// PENTING: Ganti URL dan ANON_KEY di bawah ini dengan pasokan dari dashboard Supabase Anda
const supabaseUrl = 'httpshttps'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dW5zc2Nsd2R2d2RiandzeXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDExOTksImV4cCI6MjA5NTI3NzE5OX0.z_ME9KMif183URkPRs9JpRFhsudaNTLzojdmc7GuP1ceyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dW5zc2Nsd2R2d2RiandzeXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDExOTksImV4cCI6MjA5NTI3NzE5OX0.z_ME9KMif183URkPRs9JpRFhsudaNTLzojdmc7GuP1c'

export const supabase = createClient(supabaseUrl, supabaseKey)import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
