import { Play, MoreHorizontal } from 'lucide-react'
import LikedButton from '../library/LikedButton'
import AddToPlaylistMenu from '../library/AddToPlaylistMenu'

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TrackRow({
  index,
  title,
  artist,
  album,
  duration,
  artwork,
  isActive,
  onPlay,
  track,
}) {
  const trackObj = track || { id: null, title, artist, album, duration, artwork }

  return (
    <div
      onClick={onPlay}
      className={`group flex items-center gap-3 md:gap-4 px-2 md:px-3 py-2 md:py-2.5 rounded-xl
        hover:bg-card transition cursor-pointer
        ${isActive ? 'bg-card' : ''}`}
    >
      {/* Index / play */}
      <div className="w-6 md:w-8 flex-shrink-0 flex items-center justify-center">
        <span
          className={`text-sm text-text-muted group-hover:hidden ${
            isActive ? 'text-accent' : ''
          }`}
        >
          {index}
        </span>
        <Play className="w-4 h-4 text-accent fill-accent hidden group-hover:block" />
      </div>

      {/* Artwork */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 overflow-hidden bg-white/5">
        {artwork && (
          <img
            src={artwork}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm truncate ${
            isActive ? 'text-accent' : ''
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-text-muted truncate">{artist}</p>
      </div>

      {/* Album badge — hidden on mobile */}
      <span className="hidden md:inline-block text-[10px] uppercase tracking-wider font-semibold
                       px-2 py-1 rounded-md bg-white/5 text-text-secondary flex-shrink-0">
        {album}
      </span>

      {/* Hover actions — hidden on mobile (LikedButton visible elsewhere on mobile) */}
      <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition items-center gap-2 flex-shrink-0">
        <LikedButton track={trackObj} />
        <AddToPlaylistMenu track={trackObj} />
        <button className="text-text-secondary hover:text-white">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Duration — always visible, narrower on mobile */}
      <span className="text-xs md:text-sm text-text-muted w-9 md:w-12 text-right tabular-nums flex-shrink-0">
        {typeof duration === 'number' ? formatDuration(duration) : duration}
      </span>
    </div>
  )
}