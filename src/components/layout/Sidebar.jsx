import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Search, TrendingUp, Library, Sparkles,
  Heart, Mic2, ListMusic, User, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Search, label: 'Search', to: '/search' },
  { icon: TrendingUp, label: 'Trends', to: '/trends' },
  { icon: Library, label: 'Library', to: '/library' },
]

const libraryItems = [
  { icon: Sparkles, label: 'Made for you', to: '/library' },
  { icon: Heart, label: 'Liked Songs', to: '/liked' },
  { icon: Mic2, label: 'Favorite Artists', to: '/artists' },
  { icon: ListMusic, label: 'Playlists', to: '/playlists' },
]

export function SidebarContent({ onNavigate, onOpenAuth }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const displayName = user
    ? user.user_metadata?.username || user.email?.split('@')[0] || 'User'
    : 'Guest'

  const handleClick = (to) => {
    navigate(to)
    onNavigate?.()
  }

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile')
      onNavigate?.()
    } else {
      onOpenAuth?.()
      onNavigate?.()
    }
  }

  return (
    <>
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="flex items-end gap-[3px] h-6">
          {[0.6, 1, 0.4, 0.8].map((h, i) => (
            <span
              key={i}
              className="w-[3px] bg-accent rounded-full origin-bottom animate-wave"
              style={{ height: `${h * 100}%`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-lg font-extrabold tracking-tight text-white">
          BEAT PULSE
        </span>
      </div>

      <nav className="px-3 mt-2 space-y-1">
        {navItems.map(({ icon: Icon, label, to }) => (
          <button
            key={label}
            onClick={() => handleClick(to)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-text-secondary hover:bg-white/5 hover:text-white transition"
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-6 mt-6 mb-2 text-xs uppercase tracking-wider text-text-muted">
        Your Library
      </div>

      <nav className="px-3 space-y-1">
        {libraryItems.map(({ icon: Icon, label, to }) => (
          <button
            key={label}
            onClick={() => handleClick(to)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-text-secondary hover:bg-white/5 hover:text-white transition"
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-3">
        <button
          onClick={handleProfileClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-emerald-600
                          flex items-center justify-center">
            <User className="w-4 h-4 text-black" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user ? 'My Profile' : 'Sign In'}
            </p>
            <p className="text-xs text-text-muted truncate">{displayName}</p>
          </div>
        </button>
      </div>
    </>
  )
}

export default function Sidebar({ onOpenAuth }) {
  return (
    <aside className="hidden md:flex w-[260px] flex-shrink-0 bg-surface border-r border-white/5 flex-col">
      <SidebarContent onOpenAuth={onOpenAuth} />
    </aside>
  )
}

export function MobileSidebar({ isOpen, onClose, onOpenAuth }) {
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
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 left-0 h-full w-[260px] bg-surface border-r border-white/5
                       z-50 flex flex-col md:hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-4 text-text-muted hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={onClose} onOpenAuth={onOpenAuth} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}