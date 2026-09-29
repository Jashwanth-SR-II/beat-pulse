import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { useActiveGenre } from '../../store/selectors'
import { fetchArtists } from '../../lib/jamendo'

const genres = ['Hip-Hop', 'Drill', 'Trap', 'Heavy Metal', 'Electronic', 'R&B', 'Lo-Fi']

export default function RightPanelSheet({ isOpen, onClose }) {
  const activeGenre = useActiveGenre()
  const setActiveGenre = usePlayerStore((s) => s.setActiveGenre)
  const [artists, setArtists] = useState([])

  useEffect(() => {
    if (!isOpen) return
    fetchArtists({ limit: 10, order: 'popularity_total' })
      .then((data) => {
        setArtists(data.map((a) => ({ id: a.id, name: a.name, image: a.image })))
      })
      .catch(() => setArtists([]))
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl
                       border-t border-white/10 max-h-[80vh] overflow-y-auto md:hidden"
          >
            <div className="sticky top-0 bg-surface/95 backdrop-blur px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
              <div className="w-12 h-1 rounded-full bg-white/20 absolute top-2 left-1/2 -translate-x-1/2" />
              <h2 className="text-lg font-bold mt-3">Discover</h2>
              <button
                onClick={onClose}
                className="mt-3 text-text-muted hover:text-white transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
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
                        onClick={() => {
                          setActiveGenre(isActive ? null : slug)
                          onClose()
                        }}
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

              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
                  Top Artists
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {artists.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-col items-center gap-2 flex-shrink-0 w-16"
                    >
                      <div className="w-14 h-14 rounded-full ring-2 ring-white/5 overflow-hidden bg-white/5">
                        {a.image && (
                          <img
                            src={a.image}
                            alt={a.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <span className="text-[11px] text-text-secondary text-center truncate w-full">
                        {a.name}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
