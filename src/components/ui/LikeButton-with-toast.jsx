import { Heart } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLibraryStore } from '../../store/libraryStore'
import { useToast } from './Toast'

export default function LikedButton({ track, size = 'md', className = '' }) {
  const user = useAuthStore((s) => s.user)
  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds)
  const toggleLike = useLibraryStore((s) => s.toggleLike)
  const { success, error: errorToast } = useToast()

  if (!track) return null
  const liked = likedTrackIds.has(track.id)

  const dims = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'

  const handleClick = async (e) => {
    e.stopPropagation()
    if (!user) {
      errorToast('Sign in to like songs')
      return
    }
    try {
      await toggleLike(user.id, track)
      success(liked ? 'Removed from Liked Songs' : 'Added to Liked Songs')
    } catch (err) {
      errorToast('Something went wrong')
    }
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
