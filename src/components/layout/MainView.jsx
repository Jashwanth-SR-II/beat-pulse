import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import PlaylistCard from '../cards/PlaylistCard'
import TrackRow from '../cards/TrackRow'
import NotificationsBell from '../ui/NotificationsBell'
import { TrackListSkeleton } from '../ui/Skeleton'
import { fetchTracks } from '../../lib/jamendo'
import { syncTracksToSupabase } from '../../lib/syncTracks'
import { jamendoTrackToUi } from '../../lib/transformers'
import { usePlayerStore } from '../../store/playerStore'
import { useActiveGenre, useCurrentTrack } from '../../store/selectors'

const trending = [
  { title: 'Good Vibes', subtitle: 'Chill & relax', gradient: 'from-pink-300 to-rose-400', tag: 'chill' },
  { title: "Let's Dance", subtitle: 'Party anthems', gradient: 'from-amber-300 to-orange-400', tag: 'dance' },
  { title: 'Go to the Top', subtitle: 'Motivation', gradient: 'from-sky-300 to-indigo-400', tag: 'electronic' },
  { title: 'Night Drive', subtitle: 'Late night', gradient: 'from-violet-400 to-purple-600', tag: 'ambient' },
]

export default function MainView({ onOpenDiscover, onOpenAuth }) {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingAutoPlay, setPendingAutoPlay] = useState(false)

  const activeGenre = useActiveGenre()
  const currentTrack = useCurrentTrack()
  const playTrack = usePlayerStore((s) => s.playTrack)
  const setActiveGenre = usePlayerStore((s) => s.setActiveGenre)
  const history = usePlayerStore((s) => s.history)

  const hasHistory = history.length > 0

  const handlePlaylistClick = (tag) => {
    setActiveGenre(tag)
    setPendingAutoPlay(true)
  }

  useEffect(() => {
    async function loadTracks() {
      try {
        setLoading(true)
        setError(null)
        const fetched = await fetchTracks({
          limit: 20,
          tags: activeGenre || undefined,
        })
        await syncTracksToSupabase(fetched)
        const mapped = fetched.map(jamendoTrackToUi)
        setTracks(mapped)

        if (pendingAutoPlay && mapped.length > 0) {
          playTrack(mapped[0], mapped.slice(1))
          setPendingAutoPlay(false)
        }
      } catch (err) {
        setError(err.message)
        setPendingAutoPlay(false)
      } finally {
        setLoading(false)
      }
    }
    loadTracks()
  }, [activeGenre])

  const displayTracks = hasHistory && !activeGenre ? history.slice(0, 20) : tracks

  const handlePlayTrack = (track, index) => {
    playTrack(track, displayTracks.slice(index + 1))
  }

  return (
    <main className="flex-1 overflow-y-auto bg-base">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-2xl">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            data-search-input
            placeholder="Search songs, artists, albums..."
            className="w-full bg-card border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-sm
                       placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition"
          />
        </div>

        {/* Mobile discover button */}
        <button
          onClick={onOpenDiscover}
          className="md:hidden w-10 h-10 rounded-full bg-card border border-white/5 flex items-center justify-center
                     hover:border-accent/40 transition flex-shrink-0"
          aria-label="Discover genres and artists"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <NotificationsBell onOpenAuth={onOpenAuth} />
      </div>

      <div className="px-4 md:px-8 py-6 space-y-10">
        {/* Trending Playlists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Trending Playlists</h2>
            {activeGenre && (
              <button
                onClick={() => setActiveGenre(null)}
                className="text-sm text-accent hover:underline transition"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {trending.map((p) => (
              <PlaylistCard
                key={p.title}
                {...p}
                isActive={activeGenre === p.tag}
                onClick={() => handlePlaylistClick(p.tag)}
              />
            ))}
          </div>
        </section>

        {/* Track list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {activeGenre
                ? trending.find((p) => p.tag === activeGenre)?.title || 'Playlist'
                : hasHistory
                ? 'Recently Played'
                : 'Popular Right Now'}
            </h2>
            <button className="text-sm text-text-secondary hover:text-accent transition">
              See all
            </button>
          </div>

          {loading && <TrackListSkeleton count={6} />}

          {error && (
            <div className="text-red-400 text-sm p-4 bg-red-400/10 rounded-xl">
              Failed to load tracks: {error}
            </div>
          )}

          {!loading && !error && displayTracks.length > 0 && (
            <div className="space-y-1">
              {displayTracks.map((t, i) => (
                <TrackRow
                  key={`${t.id}-${i}`}
                  index={i + 1}
                  {...t}
                  track={t}
                  isActive={currentTrack?.id === t.id}
                  onPlay={() => handlePlayTrack(t, i)}
                />
              ))}
            </div>
          )}

          {!loading && !error && displayTracks.length === 0 && (
            <div className="text-text-muted text-sm p-4 bg-card/50 rounded-xl">
              No tracks available. Try another playlist or reload.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}