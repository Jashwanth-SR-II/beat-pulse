import { supabase } from './supabaseClient'

// ============================================
// LIKED SONGS
// ============================================
export async function getLikedSongs(userId) {
  const { data, error } = await supabase
    .from('liked_songs')
    .select(`
      track_id,
      liked_at,
      tracks (*)
    `)
    .eq('user_id', userId)
    .order('liked_at', { ascending: false })

  if (error) throw error
  return (data || []).map((row) => ({
    ...dbRowToTrack(row.tracks),
    liked_at: row.liked_at,
  }))
}

export async function likeTrack(userId, trackId) {
  const { error } = await supabase
    .from('liked_songs')
    .insert({ user_id: userId, track_id: trackId })
  if (error && error.code !== '23505') throw error // 23505 = duplicate
}

export async function unlikeTrack(userId, trackId) {
  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', userId)
    .eq('track_id', trackId)
  if (error) throw error
}

export async function isTrackLiked(userId, trackId) {
  const { data, error } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', userId)
    .eq('track_id', trackId)
    .maybeSingle()
  if (error) throw error
  return !!data
}

// ============================================
// PLAYLISTS
// ============================================
export async function getUserPlaylists(userId) {
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_tracks (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((p) => ({
    ...p,
    track_count: p.playlist_tracks?.[0]?.count ?? 0,
  }))
}

export async function getPlaylistWithTracks(playlistId) {
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_tracks (
        position,
        tracks (*)
      )
    `)
    .eq('id', playlistId)
    .single()

  if (error) throw error

  const tracks = (data.playlist_tracks || [])
    .sort((a, b) => a.position - b.position)
    .map((pt) => dbRowToTrack(pt.tracks))

  return { ...data, tracks }
}

export async function createPlaylist(userId, { name, description = '', isPublic = false }) {
  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: userId, name, description, is_public: isPublic })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlaylist(playlistId, updates) {
  const { error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', playlistId)
  if (error) throw error
}

export async function deletePlaylist(playlistId) {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)
  if (error) throw error
}

export async function addTrackToPlaylist(playlistId, trackId) {
  // Get current max position
  const { data: existing } = await supabase
    .from('playlist_tracks')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existing?.[0]?.position + 1 || 0

  const { error } = await supabase
    .from('playlist_tracks')
    .insert({ playlist_id: playlistId, track_id: trackId, position: nextPosition })

  if (error && error.code !== '23505') throw error
}

export async function removeTrackFromPlaylist(playlistId, trackId) {
  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('track_id', trackId)
  if (error) throw error
}

export async function reorderPlaylistTracks(playlistId, orderedTrackIds) {
  // Bulk update via RPC would be faster, but sequential updates work for <100 tracks
  for (let i = 0; i < orderedTrackIds.length; i++) {
    await supabase
      .from('playlist_tracks')
      .update({ position: i })
      .eq('playlist_id', playlistId)
      .eq('track_id', orderedTrackIds[i])
  }
}

// ============================================
// LISTENING HISTORY
// ============================================
export async function logPlay(userId, trackId, playedSeconds = 0, completed = false) {
  const { error } = await supabase
    .from('listening_history')
    .insert({
      user_id: userId,
      track_id: trackId,
      played_seconds: playedSeconds,
      completed,
    })
  if (error) console.warn('Failed to log play:', error.message)
}

export async function getRecentHistory(userId, limit = 20) {
  const { data, error } = await supabase
    .from('listening_history')
    .select(`
      played_at,
      played_seconds,
      completed,
      tracks (*)
    `)
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  // De-duplicate by track_id (keep most recent)
  const seen = new Set()
  const result = []
  for (const row of data || []) {
    if (seen.has(row.tracks.id)) continue
    seen.add(row.tracks.id)
    result.push({ ...dbRowToTrack(row.tracks), played_at: row.played_at })
  }
  return result
}

export async function getTopArtists(userId, limit = 20) {
  const { data, error } = await supabase
    .from('user_top_artists')
    .select('*')
    .eq('user_id', userId)
    .limit(limit)

  if (error) throw error
  return data || []
}

// ============================================
// DAILY MIXES
// ============================================
export async function getDailyMixes(userId) {
  const { data, error } = await supabase
    .from('daily_mixes')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('mix_index')

  if (error) throw error
  return data || []
}

// ============================================
// HELPERS
// ============================================
function dbRowToTrack(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album || 'Single',
    duration: row.duration,
    artwork: row.artwork_url,
    audio: row.audio_url,
    genre_tags: row.genre_tags || [],
    color: '#00FF66',
  }
}

export async function getTopArtistsWithTracks(userId, limit = 20) {
  const { data, error } = await supabase
    .from('listening_history')
    .select(`
      played_at,
      tracks ( id, title, artist, artwork_url, audio_url, duration, album, genre_tags )
    `)
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(500)

  if (error) throw error

  const byArtist = new Map()

  for (const row of data || []) {
    const track = row.tracks
    if (!track?.artist) continue

    const existing = byArtist.get(track.artist)

    if (existing) {
      existing.play_count += 1
      if (row.played_at > existing.last_played) {
        existing.last_played = row.played_at
        existing.latest_track = {
          id: track.id,
          title: track.title,
          artist: track.artist,
          artwork: track.artwork_url,
          audio: track.audio_url,
          duration: track.duration,
          album: track.album || 'Single',
          genre_tags: track.genre_tags || [],
        }
      }
    } else {
      byArtist.set(track.artist, {
        artist: track.artist,
        play_count: 1,
        last_played: row.played_at,
        genre_tags: track.genre_tags || [],
        latest_track: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          artwork: track.artwork_url,
          audio: track.audio_url,
          duration: track.duration,
          album: track.album || 'Single',
          genre_tags: track.genre_tags || [],
        },
      })
    }
  }

  return Array.from(byArtist.values())
    .sort((a, b) => b.play_count - a.play_count)
    .slice(0, limit)
}