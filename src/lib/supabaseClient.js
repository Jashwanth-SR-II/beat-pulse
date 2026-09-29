import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('[supabaseClient] url:', supabaseUrl)
console.log('[supabaseClient] key present:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars. Check .env.local and restart the dev server.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)