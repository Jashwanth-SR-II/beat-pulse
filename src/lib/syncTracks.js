import { supabase } from './supabaseClient'
import { jamendoTrackToDb } from './transformers'

export async function syncTracksToSupabase(jamendoTracks) {
  if (!jamendoTracks?.length) return

  const rows = jamendoTracks.map(jamendoTrackToDb)

  const { error } = await supabase
    .from('tracks')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: false })

  if (error) {
    console.warn('Failed to sync tracks:', error.message)
  }
}
