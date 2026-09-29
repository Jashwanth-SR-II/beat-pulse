import { useEffect, useRef, useState } from 'react'
import { Bell, Music, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLibraryStore } from '../../store/libraryStore'

export default function NotificationsBell({ onOpenAuth }) {
  const user = useAuthStore((s) => s.user)
  const topArtists = useLibraryStore((s) => s.topArtists)
  const dailyMixes = useLibraryStore((s) => s.dailyMixes)

  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Close the panel when the user signs out
  useEffect(() => {
    if (!user) setOpen(false)
  }, [user])

  const notifications = []

  // Only build notifications when signed in
  if (user) {
    if (dailyMixes.length > 0) {
      notifications.push({
        id: 'mix',
        icon: Music,
        title: 'Your Daily Mixes are ready',
        subtitle: `${dailyMixes.length} fresh mixes based on your taste`,
        time: 'Today',
      })
    }

    topArtists.slice(0, 3).forEach((a, i) => {
      notifications.push({
        id: `artist-${i}`,
        icon: Clock,
        title: `You've been playing ${a.artist}`,
        subtitle: `${a.play_count} plays this week`,
        time: 'Recently',
      })
    })
  }

  const handleClick = () => {
    if (!user) {
      onOpenAuth?.()
      return
    }
    setOpen((v) => !v)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleClick}
        className="relative w-10 h-10 rounded-full bg-card border border-white/5 flex items-center justify-center
                   hover:border-accent/40 transition flex-shrink-0"
        aria-label={user ? 'Notifications' : 'Sign in to see notifications'}
      >
        <Bell className="w-4 h-4" />
        {user && notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        )}
      </button>

      {open && user && (
        <div className="absolute right-0 top-12 z-30 w-80 bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-semibold text-white">Notifications</p>
          </div>

          {notifications.length === 0 ? (
            <p className="p-6 text-sm text-text-muted text-center">
              Nothing new yet. Keep listening!
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <n.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-white">{n.title}</p>
                    <p className="text-xs text-text-muted truncate">{n.subtitle}</p>
                    <p className="text-[10px] text-text-muted mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}