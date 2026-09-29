import { useEffect } from 'react'
import { Play, Heart } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLibraryStore } from '../store/libraryStore'
import { usePlayerStore } from '../store/playerStore'
import { useCurrentTrack } from '../store/selectors'
import TrackRow from '../components/cards/TrackRow'

export default function LikedSongs({ onOpenAuth }) {
  const user = useAuthStore((s) => s.user)
  const likedTracks = useLibraryStore((s) => s.likedTracks)
  const loadLikedSongs = useLibraryStore((s) => s.loadLikedSongs)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const currentTrack = useCurrentTrack()

  useEffect(() => {
    if (user) loadLikedSongs(user.id)
  }, [user])

  const handlePlayAll = () => {
    if (likedTracks.length === 0) return
    playTrack(likedTracks[0], likedTracks.slice(1))
  }

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base px-4">
        <div className="text-center max-w-md">
          <Heart className="w-12 h-12 mx-auto mb-4 text-accent opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to save songs
          </h2>
          <p className="text-text-muted mb-6">
            Create a free account to like songs, build playlists, and sync your library
            across devices.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 rounded-full bg-accent text-black font-semibold
                       hover:scale-105 transition"
          >
            Sign In
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-base px-4 md:px-8 py-6 md:py-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-accent to-emerald-700
                        flex items-center justify-center shadow-2xl flex-shrink-0">
          <Heart className="w-12 h-12 md:w-16 md:h-16 text-black fill-black" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Playlist</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-white">Liked Songs</h1>
          <p className="text-sm text-text-secondary">
            {likedTracks.length} {likedTracks.length === 1 ? 'track' : 'tracks'}
          </p>
          <button
            onClick={handlePlayAll}
            disabled={likedTracks.length === 0}
            className="mt-4 md:mt-5 flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full
                       bg-accent text-black font-semibold hover:scale-105 transition
                       disabled:opacity-50 disabled:hover:scale-100"
          >
            <Play className="w-4 h-4 fill-current" />
            Play All
          </button>
        </div>
      </header>

      {likedTracks.length === 0 ? (
        <div className="text-center py-16 md:py-20 text-text-muted">
          <p>You haven't liked any songs yet.</p>
          <p className="text-sm mt-2">Click the heart icon on any track to save it here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {likedTracks.map((t, i) => (
            <TrackRow
              key={t.id}
              index={i + 1}
              {...t}
              track={t}
              isActive={currentTrack?.id === t.id}
              onPlay={() => playTrack(t, likedTracks.slice(i + 1))}
            />
          ))}
        </div>
      )}
    </main>
  )
}