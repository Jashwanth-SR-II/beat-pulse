import { supabase } from './supabaseClient'

export async function buildAutoQueue(currentTrack, recentIds = [], targetSize = 10) {
  if (!currentTrack) return []

  const { data, error } = await supabase.functions.invoke('auto-queue', {
    body: {
      trackId: currentTrack.id,
      recentIds,
      limit: targetSize,
    },
  })

  if (error) {
    console.warn('[autoQueue] Edge Function failed:', error.message)
    return []
  }

  return data?.results || []
}