import { Heart } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLibraryStore } from '../../store/libraryStore'

export default function LikedButton({ track, size = 'md', className = '', onRequireAuth }) {
  const user = useAuthStore((s) => s.user)
  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds)
  const toggleLike = useLibraryStore((s) => s.toggleLike)

  if (!track) return null
  const liked = likedTrackIds.has(track.id)

  const dims = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'

  const handleClick = (e) => {
    e.stopPropagation()
    if (!user) {
      onRequireAuth?.()
      return
    }
    toggleLike(user.id, track)
  }

  return (
    <button
      onClick={handleClick}
      className={`transition ${className}`}
      title={liked ? 'Unlike' : 'Like'}
      aria-label={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
    >
      <Heart
        className={`${dims} transition
          ${liked ? 'fill-accent text-accent' : 'text-text-secondary hover:text-accent'}`}
      />
    </button>
  )
}