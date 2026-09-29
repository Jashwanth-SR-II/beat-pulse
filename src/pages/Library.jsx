import { useEffect, useState } from 'react'
import { Library as LibraryIcon, Heart, ListMusic, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useLibraryStore } from '../store/libraryStore'
import { usePlayerStore } from '../store/playerStore'
import { useCurrentTrack } from '../store/selectors'
import { getDailyMixes } from '../lib/library'
import TrackRow from '../components/cards/TrackRow'
import { TrackListSkeleton } from '../components/ui/Skeleton'

export default function Library({ onOpenAuth }) {
  const user = useAuthStore((s) => s.user)
  const likedTracks = useLibraryStore((s) => s.likedTracks)
  const playlists = useLibraryStore((s) => s.playlists)
  const recentHistory = useLibraryStore((s) => s.recentHistory)
  const loadHistory = useLibraryStore((s) => s.loadHistory)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const currentTrack = useCurrentTrack()

  const [dailyMixes, setDailyMixes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([
      loadHistory(user.id),
      getDailyMixes(user.id).then(setDailyMixes).catch(() => []),
    ]).finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base px-4">
        <div className="text-center max-w-md">
          <LibraryIcon className="w-12 h-12 mx-auto mb-4 text-accent opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to build your library
          </h2>
          <p className="text-text-muted mb-6">
            Save liked songs, create playlists, and get daily mixes tailored to your taste.
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
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LibraryIcon className="w-6 h-6 text-accent" />
          <p className="text-xs uppercase tracking-widest text-text-muted">Your Collection</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">Library</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-10">
        <LibraryTile
          to="/liked"
          icon={Heart}
          label="Liked Songs"
          count={likedTracks.length}
        />
        <LibraryTile
          to="/playlists"
          icon={ListMusic}
          label="Playlists"
          count={playlists.length}
        />
        <LibraryTile
          to="/profile"
          icon={Clock}
          label="Recent Plays"
          count={recentHistory.length}
        />
      </div>

      {dailyMixes.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">Made For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {dailyMixes.map((mix) => (
              <div
                key={mix.id}
                className="bg-card border border-white/5 rounded-2xl p-5 hover:border-accent/30 transition cursor-pointer"
              >
                <div className="aspect-square bg-gradient-to-br from-accent/40 to-emerald-800/40 rounded-xl mb-3" />
                <p className="font-semibold text-white">{mix.name}</p>
                <p className="text-xs text-text-muted mt-1">
                  {mix.track_ids.length} tracks
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-white mb-4">Recently Played</h2>
        {loading && <TrackListSkeleton count={5} />}
        {!loading && recentHistory.length === 0 && (
          <p className="text-text-muted text-sm">No play history yet. Start listening!</p>
        )}
        {!loading && recentHistory.length > 0 && (
          <div className="space-y-1">
            {recentHistory.slice(0, 15).map((t, i) => (
              <TrackRow
                key={`${t.id}-${i}`}
                index={i + 1}
                {...t}
                track={t}
                isActive={currentTrack?.id === t.id}
                onPlay={() => playTrack(t, recentHistory.slice(i + 1))}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function LibraryTile({ to, icon: Icon, label, count }) {
  return (
    <Link
      to={to}
      className="bg-card border border-white/5 rounded-2xl p-5 hover:border-accent/30 transition"
    >
      <Icon className="w-5 h-5 text-accent mb-3" />
      <p className="text-2xl font-extrabold text-white">{count}</p>
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
    </Link>
  )
}