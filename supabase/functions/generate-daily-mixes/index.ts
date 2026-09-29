import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { userId } = await req.json()
    if (!userId) throw new Error('userId required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch user's top genres from listening history
    const { data: history } = await supabase
      .from('listening_history')
      .select('tracks (genre_tags)')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(200)

    // Aggregate genre frequencies
    const genreCounts: Record<string, number> = {}
    for (const row of history || []) {
      const genres = (row as any).tracks?.genre_tags || []
      for (const g of genres) genreCounts[g] = (genreCounts[g] || 0) + 1
    }

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([g]) => g)

    if (topGenres.length === 0) {
      return new Response(JSON.stringify({ mixes: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build 5 mixes, one per top genre
    const mixes = []
    for (let i = 0; i < topGenres.length; i++) {
      const genre = topGenres[i]

      // Fetch tracks from local DB first
      const { data: localTracks } = await supabase
        .from('tracks')
        .select('id')
        .contains('genre_tags', [genre])
        .limit(20)

      const trackIds = (localTracks || []).map((t) => t.id)
      if (trackIds.length === 0) continue

      // Upsert mix
      const name = `Daily Mix ${i + 1} · ${genre.charAt(0).toUpperCase() + genre.slice(1)}`
      await supabase.from('daily_mixes').upsert(
        {
          user_id: userId,
          mix_index: i + 1,
          name,
          track_ids: trackIds,
          generated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
        { onConflict: 'user_id,mix_index' }
      )

      mixes.push({ name, trackIds })
    }

    return new Response(JSON.stringify({ mixes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
