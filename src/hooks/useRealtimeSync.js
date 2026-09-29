import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'
import { useLibraryStore } from '../store/libraryStore'

export function useRealtimeSync() {
  const user = useAuthStore((s) => s.user)
  const loadLikedSongs = useLibraryStore((s) => s.loadLikedSongs)
  const loadPlaylists = useLibraryStore((s) => s.loadPlaylists)

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`library-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'liked_songs',
          filter: `user_id=eq.${user.id}`,
        },
        () => loadLikedSongs(user.id)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlists',
          filter: `user_id=eq.${user.id}`,
        },
        () => loadPlaylists(user.id)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])
}
