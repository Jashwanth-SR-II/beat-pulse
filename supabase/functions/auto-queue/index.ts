import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { trackId, recentIds = [], limit = 10 } = await req.json()
    if (!trackId) throw new Error('trackId required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ---- Step 1: Query related tracks from local DB
    const { data: related, error } = await supabase
      .rpc('get_related_tracks', { seed_track_id: trackId, result_limit: limit * 3 })

    if (error) console.warn('Related tracks error:', error)

    const excludeSet = new Set([trackId, ...recentIds])
    let pool = (related || []).filter((t: any) => !excludeSet.has(t.id))

    // ---- Step 2: Fall back to Jamendo if pool is thin
    if (pool.length < limit) {
      const { data: seed } = await supabase
        .from('tracks')
        .select('genre_tags')
        .eq('id', trackId)
        .single()

      const genre = seed?.genre_tags?.[0]

      try {
        const clientId = Deno.env.get('JAMENDO_CLIENT_ID')!
        const params = new URLSearchParams({
          client_id: clientId,
          format: 'json',
          limit: '25',
          order: 'popularity_total',
          include: 'musicinfo',
          audioformat: 'mp32',
        })
        if (genre) params.set('tags', genre)

        const jRes = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params}`)
        const jData = await jRes.json()

        const jamendoTracks = (jData.results || []).map((t: any) => ({
          id: String(t.id),
          title: t.name,
          artist: t.artist_name,
          album: t.album_name || 'Single',
          duration: t.duration,
          artwork: t.image,
          audio: t.audio,
          genre_tags: t.musicinfo?.tags?.genres || [],
        }))

        const filtered = jamendoTracks.filter((t: any) => !excludeSet.has(t.id))

        // Upsert to cache
        if (filtered.length > 0) {
          const rows = filtered.map((t: any) => ({
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

        pool = [...pool, ...filtered]
      } catch (err) {
        console.warn('Jamendo fallback failed:', err)
      }
    }

    // ---- Step 3: Convert to UI shape and shuffle
    const result = pool
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        artist: row.artist,
        album: row.album || 'Single',
        duration: row.duration,
        artwork: row.artwork_url,
        audio: row.audio_url,
        genre_tags: row.genre_tags || [],
      }))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)

    return new Response(JSON.stringify({ results: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
