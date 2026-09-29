import { supabase } from './supabaseClient'

export async function searchAll(query, limit = 30) {
  if (!query || query.trim().length < 2) return { results: [] }

  const { data, error } = await supabase.functions.invoke('search-tracks-v2', {
    body: { query: query.trim(), limit },
  })

  if (error) throw new Error(error.message)
  return data || { results: [] }
}
