import { Search as SearchIcon, X } from 'lucide-react'
import { useSearch } from '../hooks/useSearch'
import { usePlayerStore } from '../store/playerStore'
import { useCurrentTrack } from '../store/selectors'
import TrackRow from '../components/cards/TrackRow'

export default function Search() {
  const { query, setQuery, results, loading, error } = useSearch()
  const playTrack = usePlayerStore((s) => s.playTrack)
  const currentTrack = useCurrentTrack()

  return (
    <main className="flex-1 overflow-y-auto bg-base">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-3 md:py-4">
        <div className="relative max-w-2xl mx-auto md:mx-0">
          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            data-search-input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full bg-card border border-white/5 rounded-full pl-10 pr-10 py-3 text-sm
                       placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {!query && (
          <div className="text-center py-16 md:py-20 text-text-muted">
            <SearchIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-40" />
            <p className="text-base md:text-lg font-semibold text-text-secondary">
              Search for songs, artists, or albums
            </p>
            <p className="text-sm mt-2">Type at least 2 characters to start.</p>
          </div>
        )}

        {query && query.length < 2 && (
          <p className="text-text-muted text-sm text-center py-8">Keep typing…</p>
        )}

        {loading && (
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-card/50 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm p-4 bg-red-400/10 rounded-xl">
            Search failed: {error}
          </div>
        )}

        {!loading && !error && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-12 md:py-16 text-text-muted">
            <p>No results for "{query}"</p>
            <p className="text-sm mt-2">Try a different artist or genre.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm text-text-muted mb-4">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            <div className="space-y-1">
              {results.map((t, i) => (
                <TrackRow
                  key={`${t.id}-${i}`}
                  index={i + 1}
                  {...t}
                  track={t}
                  isActive={currentTrack?.id === t.id}
                  onPlay={() => playTrack(t, results.slice(i + 1))}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}