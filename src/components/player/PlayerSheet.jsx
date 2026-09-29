import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import {
  useCurrentTrack,
  useIsPlaying,
  useCurrentTime,
  useDuration,
} from '../../store/selectors'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PlayerSheet() {
  const currentTrack = useCurrentTrack()
  const isPlaying = useIsPlaying()
  const currentTime = useCurrentTime()
  const duration = useDuration()

  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const playNext = usePlayerStore((s) => s.playNext)
  const enterFocusMode = usePlayerStore((s) => s.enterFocusMode)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-3 left-3 right-3 z-30 bg-card border border-white/10 rounded-2xl
                     shadow-2xl overflow-hidden md:hidden"
        >
          {/* Progress line */}
          <div className="h-0.5 bg-white/10">
            <div
              className="h-full bg-accent transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3 p-3">
            <button
              onClick={enterFocusMode}
              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5"
            >
              {currentTrack.artwork && (
                <img
                  src={currentTrack.artwork}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </button>

            <button
              onClick={enterFocusMode}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
              <p className="text-xs text-text-muted truncate">
                {currentTrack.artist}
                <span className="mx-1.5">·</span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-black fill-black" />
              ) : (
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="w-10 h-10 flex items-center justify-center text-text-secondary flex-shrink-0"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
