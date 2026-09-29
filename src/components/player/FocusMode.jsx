import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import {
  useCurrentTrack,
  useIsPlaying,
  useIsFocusMode,
  usePalette,
} from '../../store/selectors'
import ProgressBar from './ProgressBar'
import LyricsPanel from './LyricsPanel'
import Visualizer from './Visualizer'
import LikedButton from '../library/LikedButton'
import { useIsMobile } from '../../hooks/useMediaQuery'

export default function FocusMode() {
  const isFocusMode = useIsFocusMode()
  const currentTrack = useCurrentTrack()
  const isPlaying = useIsPlaying()
  const palette = usePalette()
  const isMobile = useIsMobile()

  const exitFocusMode = usePlayerStore((s) => s.exitFocusMode)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const playNext = usePlayerStore((s) => s.playNext)
  const playPrevious = usePlayerStore((s) => s.playPrevious)

  const primary = palette?.primary || '#00FF66'
  const dark = palette?.dark || '#0B0B0E'

  return (
    <AnimatePresence>
      {isFocusMode && currentTrack && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          className="fixed inset-0 z-40 overflow-hidden"
          style={{
            background: `radial-gradient(circle at 20% 20%, ${primary}22, transparent 45%),
                         radial-gradient(circle at 80% 80%, ${dark}ee, transparent 60%),
                         linear-gradient(180deg, #0B0B0E, ${dark})`,
          }}
        >
          <div
            className="absolute inset-0 opacity-20 blur-[120px] scale-110"
            style={{
              backgroundImage: `url(${currentTrack.artwork})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <button
            onClick={exitFocusMode}
            className="fixed md:absolute top-4 md:top-6 left-4 md:left-6 z-50 w-10 h-10
                      rounded-full bg-black/60 md:bg-white/10 backdrop-blur-md
                      border border-white/10
                      flex items-center justify-center hover:bg-white/20 transition"
            aria-label="Exit focus mode"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          {/* Desktop layout: side-by-side */}
          {!isMobile && (
            <div className="relative h-full flex items-center justify-center px-12 py-10 gap-20">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="relative flex-shrink-0"
              >
                <div
                  className="w-[440px] h-[440px] rounded-3xl overflow-hidden shadow-2xl"
                  style={{ boxShadow: `0 40px 120px ${primary}55` }}
                >
                  <img
                    src={currentTrack.artwork}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-8 flex justify-center">
                  <Visualizer
                    barCount={60}
                    barWidth={3}
                    barGap={3}
                    height={60}
                    color={primary}
                    mirrored
                  />
                </div>
              </motion.div>

              <div className="flex-1 max-w-[560px] flex flex-col h-full">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-2">
                      Now Playing
                    </p>
                    <h1 className="text-4xl font-extrabold leading-tight truncate">
                      {currentTrack.title}
                    </h1>
                    <p className="text-lg text-white/60 mt-1 truncate">
                      {currentTrack.artist}
                    </p>
                  </div>
                  <LikedButton track={currentTrack} size="lg" className="mt-1 flex-shrink-0" />
                </div>

                <div className="mb-8 min-h-0 flex-1">
                  <LyricsPanel />
                </div>

                <div className="mt-auto space-y-4 flex-shrink-0">
                  <ProgressBar />
                  <Controls
                    isPlaying={isPlaying}
                    primary={primary}
                    onPrev={playPrevious}
                    onPlay={togglePlay}
                    onNext={playNext}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile layout: stacked */}
          {isMobile && (
            <div className="relative h-full flex flex-col px-6 pt-20 pb-6 overflow-hidden">
              {/* Artwork */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-shrink-0 mx-auto"
              >
                <div
                  className="w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl"
                  style={{ boxShadow: `0 30px 90px ${primary}55` }}
                >
                  <img
                    src={currentTrack.artwork}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Title + like */}
              <div className="mt-6 flex items-start justify-between gap-3 flex-shrink-0">
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold leading-tight truncate">
                    {currentTrack.title}
                  </h1>
                  <p className="text-sm text-white/60 mt-1 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
                <LikedButton track={currentTrack} size="md" className="mt-1 flex-shrink-0" />
              </div>

              {/* Lyrics takes remaining space */}
              <div className="flex-1 min-h-0 my-4">
                <LyricsPanel />
              </div>

              {/* Progress + controls pinned to bottom */}
              <div className="flex-shrink-0 space-y-3">
                <ProgressBar />
                <Controls
                  isPlaying={isPlaying}
                  primary={primary}
                  onPrev={playPrevious}
                  onPlay={togglePlay}
                  onNext={playNext}
                  compact
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Controls({ isPlaying, primary, onPrev, onPlay, onNext, compact = false }) {
  const size = compact ? 'w-12 h-12' : 'w-14 h-14'
  const iconSize = compact ? 'w-5 h-5' : 'w-6 h-6'
  const sideIcon = compact ? 'w-5 h-5' : 'w-6 h-6'

  return (
    <div className={`flex items-center justify-center ${compact ? 'gap-5' : 'gap-6'}`}>
      <button
        onClick={onPrev}
        className="text-white/70 hover:text-white transition"
        aria-label="Previous track"
      >
        <SkipBack className={`${sideIcon} fill-current`} />
      </button>
      <button
        onClick={onPlay}
        className={`${size} rounded-full flex items-center justify-center transition hover:scale-105`}
        style={{ backgroundColor: primary, boxShadow: `0 0 40px ${primary}66` }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className={`${iconSize} text-black fill-black`} />
        ) : (
          <Play className={`${iconSize} text-black fill-black ml-0.5`} />
        )}
      </button>
      <button
        onClick={onNext}
        className="text-white/70 hover:text-white transition"
        aria-label="Next track"
      >
        <SkipForward className={`${sideIcon} fill-current`} />
      </button>
    </div>
  )
}