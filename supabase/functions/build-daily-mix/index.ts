import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // When called by cron (no body), process all users.
    // When called manually with { userId }, process just that user.
    let userIds: string[] = []
    try {
      const body = await req.json()
      if (body?.userId) userIds = [body.userId]
    } catch {
      // no body — cron mode
    }

    if (userIds.length === 0) {
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .limit(500)
      userIds = (users || []).map((u: any) => u.id)
    }

    const allMixes: Record<string, any[]> = {}

    for (const userId of userIds) {
      const { data: history } = await supabase
        .from('listening_history')
        .select('tracks (genre_tags)')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(200)

      const genreCounts: Record<string, number> = {}
      for (const row of history || []) {
        const genres = (row as any).tracks?.genre_tags || []
        for (const g of genres) genreCounts[g] = (genreCounts[g] || 0) + 1
      }

      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([g]) => g)

      const userMixes = []

      for (let i = 0; i < topGenres.length; i++) {
        const genre = topGenres[i]
        const { data: localTracks } = await supabase
          .from('tracks')
          .select('id')
          .contains('genre_tags', [genre])
          .limit(30)

        const ids = (localTracks || []).map((t: any) => t.id)
        if (ids.length === 0) continue

        const shuffled = ids.sort(() => Math.random() - 0.5).slice(0, 20)
        const name = `Daily Mix ${i + 1} · ${genre.charAt(0).toUpperCase() + genre.slice(1)}`

        await supabase.from('daily_mixes').upsert(
          {
            user_id: userId,
            mix_index: i + 1,
            name,
            track_ids: shuffled,
            generated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 86400000).toISOString(),
          },
          { onConflict: 'user_id,mix_index' }
        )

        userMixes.push({ name, trackIds: shuffled })
      }

      allMixes[userId] = userMixes
    }

    return new Response(JSON.stringify({ mixes: allMixes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
