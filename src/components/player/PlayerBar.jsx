import { useState } from 'react'
import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Repeat,
  Shuffle,
  Maximize2,
  ListMusic,
} from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import {
  useCurrentTrack,
  useIsPlaying,
  useVolume,
  useRepeatMode,
  useShuffle,
  useQueue,
} from '../../store/selectors'
import Visualizer from './Visualizer'
import ProgressBar from './ProgressBar'
import QueuePanel from './QueuePanel'

export default function PlayerBar() {
  const currentTrack = useCurrentTrack()
  const isPlaying = useIsPlaying()
  const volume = useVolume()
  const repeatMode = useRepeatMode()
  const shuffle = useShuffle()
  const queue = useQueue()

  const [queueOpen, setQueueOpen] = useState(false)

  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const playNext = usePlayerStore((s) => s.playNext)
  const playPrevious = usePlayerStore((s) => s.playPrevious)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleMute = usePlayerStore((s) => s.toggleMute)
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const enterFocusMode = usePlayerStore((s) => s.enterFocusMode)

  return (
    <>
      <footer className="hidden md:flex h-[88px] flex-shrink-0 bg-surface border-t border-white/5 px-6 items-center gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-3 w-[280px]">
          <button
            onClick={() => currentTrack && enterFocusMode()}
            disabled={!currentTrack}
            className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent to-emerald-700 overflow-hidden flex-shrink-0
                       hover:ring-2 hover:ring-accent/40 transition disabled:cursor-default"
          >
            {currentTrack?.artwork && (
              <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">
              {currentTrack?.title || 'Nothing playing'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {currentTrack?.artist || '—'}
            </p>
          </div>

          {currentTrack && (
            <Visualizer barCount={14} barWidth={2} barGap={2} height={24} />
          )}

          <button
            disabled={!currentTrack}
            className="ml-1 text-text-muted hover:text-accent transition disabled:opacity-30"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              disabled={!currentTrack}
              className={`transition disabled:opacity-30
                ${shuffle ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={playPrevious}
              disabled={!currentTrack}
              className="text-text-secondary hover:text-white transition disabled:opacity-30"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center
                         hover:scale-105 transition shadow-lg shadow-accent/20
                         disabled:opacity-40 disabled:hover:scale-100"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-black" />
              ) : (
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              disabled={!currentTrack}
              className="text-text-secondary hover:text-white transition disabled:opacity-30"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={toggleRepeat}
              disabled={!currentTrack}
              className={`transition relative disabled:opacity-30
                ${repeatMode !== 'off' ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>
              )}
            </button>
          </div>

          <ProgressBar />
        </div>

        {/* RIGHT */}
        <div className="w-[280px] flex items-center justify-end gap-3">
          <button
            onClick={() => setQueueOpen((v) => !v)}
            disabled={!currentTrack}
            className={`relative transition disabled:opacity-30
              ${queueOpen ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full
                               bg-accent text-black text-[9px] font-bold flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => currentTrack && enterFocusMode()}
            disabled={!currentTrack}
            className="text-text-secondary hover:text-white transition disabled:opacity-30"
            title="Focus mode"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMute}
            className="text-text-secondary hover:text-white transition"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-[#00FF66] cursor-pointer"
          />
        </div>
      </footer>

      <QueuePanel isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
    </>
  )
}