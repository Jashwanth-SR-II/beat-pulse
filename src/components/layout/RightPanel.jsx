import { useEffect, useState } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { useActiveGenre } from '../../store/selectors'
import { fetchArtists } from '../../lib/jamendo'

const genres = ['Hip-Hop', 'Drill', 'Trap', 'Heavy Metal', 'Electronic', 'R&B', 'Lo-Fi']

export default function RightPanel() {
  const activeGenre = useActiveGenre()
  const setActiveGenre = usePlayerStore((s) => s.setActiveGenre)
  const [artists, setArtists] = useState([])

  useEffect(() => {
    fetchArtists({ limit: 10, order: 'popularity_total' })
      .then((data) => {
        setArtists(
          data.map((a) => ({
            id: a.id,
            name: a.name,
            image: a.image,
          }))
        )
      })
      .catch(() => setArtists([]))
  }, [])

  return (
    <aside className="w-[320px] flex-shrink-0 bg-surface border-l border-white/5 overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Genres */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
            Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const slug = g.toLowerCase().replace(/\s+/g, '-')
              const isActive = activeGenre === slug
              return (
                <button
                  key={g}
                  onClick={() => setActiveGenre(isActive ? null : slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                    ${isActive
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'bg-card border-white/5 text-text-secondary hover:text-accent hover:border-accent/40'
                    }`}
                >
                  {g}
                </button>
              )
            })}
          </div>
        </section>

        {/* Real Artists */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
            Top Artists
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {artists.map((a) => (
              <div
                key={a.id}
                className="flex flex-col items-center gap-2 flex-shrink-0 w-16 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full ring-2 ring-white/5 hover:ring-accent/60 transition overflow-hidden bg-white/5">
                  {a.image ? (
                    <img
                      src={a.image}
                      alt={a.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <span className="text-[11px] text-text-secondary text-center truncate w-full">
                  {a.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Remove the hardcoded Top Charts — link to Trends instead */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
            Top Charts
          </h3>
          <a
            href="/trends"
            className="block text-sm text-accent hover:underline"
          >
            View Jamendo Top 50 →
          </a>
        </section>
      </div>
    </aside>
  )
}