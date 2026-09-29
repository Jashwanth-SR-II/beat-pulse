import { useEffect, useState } from 'react'
import { Mic2, Play, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usePlayerStore } from '../store/playerStore'
import { useCurrentTrack } from '../store/selectors'
import { getTopArtistsWithTracks } from '../lib/library'
import { searchArtistByName, fetchArtistTracks } from '../lib/jamendo'
import { jamendoTrackToUi } from '../lib/transformers'
import TrackRow from '../components/cards/TrackRow'
import { TrackListSkeleton } from '../components/ui/Skeleton'

export default function FavoriteArtists({ onOpenAuth }) {
  const user = useAuthStore((s) => s.user)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const currentTrack = useCurrentTrack()

  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArtist, setSelectedArtist] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const rows = await getTopArtistsWithTracks(user.id, 30)

        const enriched = await Promise.all(
          rows.map(async (row) => {
            try {
              const jamendoArtist = await searchArtistByName(row.artist)
              return {
                ...row,
                image: jamendoArtist?.image || null,
                jamendo_id: jamendoArtist?.id || null,
              }
            } catch {
              return { ...row, image: null, jamendo_id: null }
            }
          })
        )

        if (!cancelled) setArtists(enriched)
      } catch (err) {
        console.warn('FavoriteArtists load failed:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base px-4">
        <div className="text-center max-w-md">
          <Mic2 className="w-12 h-12 mx-auto mb-4 text-accent opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to see your top artists
          </h2>
          <p className="text-text-muted mb-6">
            We track the artists you play most and show them here.
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

  if (selectedArtist) {
    return (
      <ArtistDetail
        artist={selectedArtist}
        onBack={() => setSelectedArtist(null)}
        playTrack={playTrack}
        currentTrack={currentTrack}
      />
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-base px-4 md:px-8 py-6 md:py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Mic2 className="w-6 h-6 text-accent" />
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Your Top Artists
          </p>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Favorite Artists
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          Artists you've played the most, ranked by play count.
        </p>
      </header>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-card/50 animate-pulse" />
              <div className="w-20 h-3 bg-card/50 rounded animate-pulse" />
              <div className="w-12 h-2.5 bg-card/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && artists.length === 0 && (
        <div className="text-center py-20 text-text-muted">
          <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-semibold text-text-secondary">
            No favorite artists yet
          </p>
          <p className="text-sm mt-2">
            Play more tracks and your top artists will appear here.
          </p>
        </div>
      )}

      {!loading && artists.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {artists.map((a, i) => (
            <ArtistCard
              key={`${a.artist}-${i}`}
              artist={a}
              rank={i + 1}
              onClick={() => setSelectedArtist(a)}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function ArtistCard({ artist, rank, onClick }) {
  const initials = artist.artist
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 group cursor-pointer"
    >
      <div className="relative">
        <div
          className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden
                     ring-2 ring-white/5 group-hover:ring-accent/60 transition
                     bg-gradient-to-br from-accent to-emerald-600
                     flex items-center justify-center shadow-lg shadow-accent/10
                     group-hover:scale-105 transition-transform"
        >
          {artist.image ? (
            <img
              src={artist.image}
              alt={artist.artist}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-black font-extrabold text-2xl md:text-3xl">
              {initials}
            </span>
          )}
        </div>

        <span
          className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-accent text-black
                     text-xs font-bold flex items-center justify-center shadow-lg shadow-accent/30"
        >
          {rank}
        </span>

        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100
                        flex items-center justify-center transition">
          <Play className="w-8 h-8 text-accent fill-accent" />
        </div>
      </div>

      <div className="text-center min-w-0 w-full">
        <p className="text-sm font-semibold text-white truncate">
          {artist.artist}
        </p>
        <p className="text-xs text-text-muted">
          {artist.play_count} {artist.play_count === 1 ? 'play' : 'plays'}
        </p>
      </div>
    </button>
  )
}

function ArtistDetail({ artist, onBack, playTrack, currentTrack }) {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const results = await fetchArtistTracks(artist.artist, 30)
        if (!cancelled) setTracks(results.map(jamendoTrackToUi))
      } catch (err) {
        console.warn('Artist tracks failed:', err)
        if (!cancelled) setTracks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [artist.artist])

  const initials = artist.artist
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    playTrack(tracks[0], tracks.slice(1))
  }

  return (
    <main className="flex-1 overflow-y-auto bg-base px-4 md:px-8 py-6 md:py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-secondary
                   hover:text-accent transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to artists
      </button>

      <header className="flex flex-col sm:flex-row items-start sm:items-end gap-4 md:gap-6 mb-8">
        <div
          className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0
                     ring-4 ring-accent/20 shadow-2xl shadow-accent/10
                     bg-gradient-to-br from-accent to-emerald-600
                     flex items-center justify-center"
        >
          {artist.image ? (
            <img
              src={artist.image}
              alt={artist.artist}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-black font-extrabold text-4xl md:text-5xl">
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-text-muted mb-1">
            Artist
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 truncate">
            {artist.artist}
          </h1>
          <p className="text-sm text-text-secondary">
            {artist.play_count}{' '}
            {artist.play_count === 1 ? 'play in your history' : 'plays in your history'}
          </p>
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="mt-4 flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full
                       bg-accent text-black font-semibold hover:scale-105 transition
                       disabled:opacity-50 disabled:hover:scale-100"
          >
            <Play className="w-4 h-4 fill-current" />
            Play All
          </button>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">Popular Tracks</h2>

        {loading && <TrackListSkeleton count={6} />}

        {!loading && tracks.length === 0 && (
          <p className="text-text-muted text-sm">
            No tracks found for this artist on Jamendo.
          </p>
        )}

        {!loading && tracks.length > 0 && (
          <div className="space-y-1">
            {tracks.map((t, i) => (
              <TrackRow
                key={`${t.id}-${i}`}
                index={i + 1}
                {...t}
                track={t}
                isActive={currentTrack?.id === t.id}
                onPlay={() => playTrack(t, tracks.slice(i + 1))}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}