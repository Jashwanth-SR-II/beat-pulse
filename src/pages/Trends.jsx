import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { fetchTracks } from '../lib/jamendo'
import { jamendoTrackToUi } from '../lib/transformers'
import { usePlayerStore } from '../store/playerStore'
import { useCurrentTrack } from '../store/selectors'
import TrackRow from '../components/cards/TrackRow'
import { TrackListSkeleton } from '../components/ui/Skeleton'

export default function Trends() {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const currentTrack = useCurrentTrack()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const fetched = await fetchTracks({
          limit: 50,
          order: 'popularity_total',   // Jamendo's all-time top
        })
        setTracks(fetched.map(jamendoTrackToUi))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="flex-1 overflow-y-auto bg-base px-8 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Jamendo Top Charts
          </p>
        </div>
        <h1 className="text-4xl font-extrabold">Trending on Jamendo</h1>
        <p className="text-sm text-text-secondary mt-2">
          The most-played independent tracks on the platform. Not mainstream charts —
          Jamendo only carries Creative Commons music.
        </p>
      </header>

      {loading && <TrackListSkeleton count={10} />}
      {error && (
        <div className="text-red-400 text-sm p-4 bg-red-400/10 rounded-xl">
          Failed to load: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-1">
          {tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              index={i + 1}
              {...t}
              track={t}
              isActive={currentTrack?.id === t.id}
              onPlay={() => playTrack(t, tracks.slice(i + 1))}
            />
          ))}
        </div>
      )}
    </main>
  )
}
