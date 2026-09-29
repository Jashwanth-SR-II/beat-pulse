import { useCurrentTime, useDuration } from '../../store/selectors'
import { seekAudio } from '../../lib/audioEngine'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ProgressBar() {
  const currentTime = useCurrentTime()
  const duration = useDuration()
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleScrub = (e) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekAudio(ratio * duration)
  }

  return (
    <div className="w-full flex items-center gap-2 md:gap-3">
      <span className="text-[10px] md:text-xs text-text-muted tabular-nums w-8 md:w-10 text-right">
        {formatTime(currentTime)}
      </span>
      <div
        onClick={handleScrub}
        className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden group cursor-pointer"
      >
        <div
          className="h-full bg-accent rounded-full relative transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent
                          opacity-0 group-hover:opacity-100 transition" />
        </div>
      </div>
      <span className="text-[10px] md:text-xs text-text-muted tabular-nums w-8 md:w-10">
        {formatTime(duration)}
      </span>
    </div>
  )
}