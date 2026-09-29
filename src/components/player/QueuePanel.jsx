import { motion, AnimatePresence } from 'framer-motion'
import { X, GripVertical } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { useQueue, useCurrentTrack } from '../../store/selectors'

export default function QueuePanel({ isOpen, onClose }) {
  const queue = useQueue()
  const currentTrack = useCurrentTrack()
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue)
  const playTrack = usePlayerStore((s) => s.playTrack)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="fixed top-0 right-0 h-full w-[360px] bg-surface border-l border-white/5 z-30 flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 className="text-lg font-bold">Up Next</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {currentTrack && (
              <div className="px-3 py-2 mb-2">
                <p className="text-xs uppercase tracking-wider text-accent mb-2">
                  Now Playing
                </p>
                <QueueRow track={currentTrack} isActive />
              </div>
            )}

            {queue.length === 0 && (
              <p className="text-text-muted text-sm text-center py-8">
                Queue is empty. Playing related tracks next.
              </p>
            )}

            {queue.length > 0 && (
              <>
                <p className="text-xs uppercase tracking-wider text-text-muted px-3 mb-1">
                  Next Up
                </p>
                {queue.map((track, i) => (
                  <QueueRow
                    key={`${track.id}-${i}`}
                    track={track}
                    onPlay={() => playTrack(track, queue.slice(i + 1))}
                    onRemove={() => removeFromQueue(i)}
                  />
                ))}
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function QueueRow({ track, isActive, onPlay, onRemove }) {
  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer
        ${isActive ? 'bg-accent/10' : 'hover:bg-card'}`}
      onClick={onPlay}
    >
      <div className="w-10 h-10 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
        {track.artwork && (
          <img src={track.artwork} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isActive ? 'text-accent' : ''}`}>
          {track.title}
        </p>
        <p className="text-xs text-text-muted truncate">{track.artist}</p>
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="opacity-0 group-hover:opacity-100 transition text-text-muted hover:text-red-400"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
