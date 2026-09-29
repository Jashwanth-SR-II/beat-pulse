import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { query, limit = 30 } = await req.json()
    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ---- Step 1: Local full-text search
    const { data: localResults, error: localError } = await supabase
      .rpc('search_tracks', { search_query: query.trim(), result_limit: limit })

    if (localError) console.warn('Local search error:', localError)

    const local = (localResults || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      album: row.album || 'Single',
      duration: row.duration,
      artwork: row.artwork_url,
      audio: row.audio_url,
      genre_tags: row.genre_tags || [],
    }))

    // ---- Step 2: If local results are thin, hit Jamendo
    let combined = local
    if (local.length < limit) {
      try {
        const clientId = Deno.env.get('JAMENDO_CLIENT_ID')!
        const params = new URLSearchParams({
          client_id: clientId,
          format: 'json',
          limit: String(limit - local.length),
          search: query.trim(),
          include: 'musicinfo',
          audioformat: 'mp32',
        })
        const jamendoRes = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params}`)
        const jamendoData = await jamendoRes.json()

        const jamendoTracks = (jamendoData.results || []).map((t: any) => ({
          id: String(t.id),
          title: t.name,
          artist: t.artist_name,
          album: t.album_name || 'Single',
          duration: t.duration,
          artwork: t.image,
          audio: t.audio,
          genre_tags: t.musicinfo?.tags?.genres || [],
        }))

        // De-dupe against local
        const seen = new Set(local.map((t: any) => t.id))
        const extra = jamendoTracks.filter((t: any) => !seen.has(t.id))
        combined = [...local, ...extra]

        // Cache new tracks into Supabase (fire and forget)
        if (extra.length > 0) {
          const rows = extra.map((t: any) => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            album: t.album,
            duration: t.duration,
            artwork_url: t.artwork,
            audio_url: t.audio,
            genre_tags: t.genre_tags,
          }))
          supabase
            .from('tracks')
            .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
            .then(() => {})
        }
      } catch (err) {
        console.warn('Jamendo search failed:', err)
      }
    }

    return new Response(JSON.stringify({ results: combined.slice(0, limit) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
