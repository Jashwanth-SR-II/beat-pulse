import { create } from 'zustand'
import * as lib from '../lib/library'

export const useLibraryStore = create((set, get) => ({
  // STATE
  likedTrackIds: new Set(),
  likedTracks: [],
  playlists: [],
  recentHistory: [],
  topArtists: [],
  dailyMixes: [],
  loading: false,

  // ============================================
  // LIKED SONGS
  // ============================================
  loadLikedSongs: async (userId) => {
    if (!userId) return
    try {
      const tracks = await lib.getLikedSongs(userId)
      set({
        likedTracks: tracks,
        likedTrackIds: new Set(tracks.map((t) => t.id)),
      })
    } catch (err) {
      console.warn('loadLikedSongs failed:', err)
    }
  },

  toggleLike: async (userId, track) => {
    if (!userId) return
    const ids = new Set(get().likedTrackIds)
    const liked = ids.has(track.id)

    if (liked) {
      ids.delete(track.id)
    } else {
      ids.add(track.id)
    }
    set({ likedTrackIds: ids })

    try {
      if (liked) {
        await lib.unlikeTrack(userId, track.id)
      } else {
        const { supabase } = await import('../lib/supabaseClient')
        const { jamendoTrackToDb } = await import('../lib/transformers')
        await supabase
          .from('tracks')
          .upsert(jamendoTrackToDb(track), { onConflict: 'id', ignoreDuplicates: true })

        await lib.likeTrack(userId, track.id)
      }
      await get().loadLikedSongs(userId)
    } catch (err) {
      console.warn('toggleLike failed, reverting:', err)
      const revert = new Set(get().likedTrackIds)
      if (liked) revert.add(track.id)
      else revert.delete(track.id)
      set({ likedTrackIds: revert })
    }
  },

  isLiked: (trackId) => get().likedTrackIds.has(trackId),

  // ============================================
  // PLAYLISTS
  // ============================================
  loadPlaylists: async (userId) => {
    if (!userId) return
    try {
      set({ loading: true })
      const playlists = await lib.getUserPlaylists(userId)
      set({ playlists, loading: false })
    } catch (err) {
      console.warn('loadPlaylists failed:', err)
      set({ loading: false })
    }
  },

  createPlaylist: async (userId, payload) => {
    if (!userId) return null
    const created = await lib.createPlaylist(userId, payload)
    await get().loadPlaylists(userId)
    return created
  },

  deletePlaylist: async (userId, playlistId) => {
    if (!userId) return
    set({ playlists: get().playlists.filter((p) => p.id !== playlistId) })
    try {
      await lib.deletePlaylist(playlistId)
    } catch (err) {
      await get().loadPlaylists(userId)
    }
  },

  addToPlaylist: async (playlistId, track) => {
    const { supabase } = await import('../lib/supabaseClient')
    const { jamendoTrackToDb } = await import('../lib/transformers')
    await supabase
      .from('tracks')
      .upsert(jamendoTrackToDb(track), { onConflict: 'id', ignoreDuplicates: true })
    await lib.addTrackToPlaylist(playlistId, track.id)
  },

  // ============================================
  // HISTORY & ARTISTS
  // ============================================
  loadHistory: async (userId) => {
    if (!userId) return
    try {
      const history = await lib.getRecentHistory(userId, 30)
      set({ recentHistory: history })
    } catch (err) {
      console.warn('loadHistory failed:', err)
    }
  },

  loadTopArtists: async (userId) => {
    if (!userId) return
    try {
      const artists = await lib.getTopArtists(userId, 20)
      set({ topArtists: artists })
    } catch (err) {
      console.warn('loadTopArtists failed:', err)
    }
  },

  loadDailyMixes: async (userId) => {
    if (!userId) return
    try {
      const mixes = await lib.getDailyMixes(userId)
      set({ dailyMixes: mixes })
    } catch (err) {
      console.warn('loadDailyMixes failed:', err)
    }
  },
}))

reset: () =>
  set({
    likedTrackIds: new Set(),
    likedTracks: [],
    playlists: [],
    recentHistory: [],
    topArtists: [],
    dailyMixes: [],
    loading: false,
  })