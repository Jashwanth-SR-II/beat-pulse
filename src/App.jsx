import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar, { MobileSidebar } from './components/layout/Sidebar'
import MainView from './components/layout/MainView'
import RightPanel from './components/layout/RightPanel'
import RightPanelSheet from './components/layout/RightPanelSheet'
import PlayerBar from './components/player/PlayerBar'
import PlayerSheet from './components/player/PlayerSheet'
import FocusMode from './components/player/FocusMode'
import AuthModal from './components/auth/AuthModal'
import LikedSongs from './pages/LikedSongs'
import Playlists from './pages/Playlists'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Trends from './pages/Trends'
import Library from './pages/Library'
import FavoriteArtists from './pages/FavoriteArtists'
import { ToastProvider } from './components/ui/Toast'
import { useAuthStore } from './store/authStore'
import { useLibraryStore } from './store/libraryStore'
import { initializeAudioEngine, unlockAudioOnFirstGesture } from './lib/audioEngine'
import { useAdaptivePalette } from './hooks/useAdaptivePalette'
import { useAutoQueue } from './hooks/useAutoQueue'
import { useListeningHistory } from './hooks/useListeningHistory'
import { useRealtimeSync } from './hooks/useRealtimeSync'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useMediaSession } from './hooks/useMediaSession'
import { useIsMobile } from './hooks/useMediaQuery'

function AppLayout() {
  const { initialize, user } = useAuthStore()
  const loadLikedSongs = useLibraryStore((s) => s.loadLikedSongs)
  const loadPlaylists = useLibraryStore((s) => s.loadPlaylists)
  const isMobile = useIsMobile()
  const location = useLocation()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    initialize()
    initializeAudioEngine()
    unlockAudioOnFirstGesture()
  }, [])

  useEffect(() => {
    if (user) {
      loadLikedSongs(user.id)
      loadPlaylists(user.id)
    }
  }, [user])

  useAdaptivePalette()
  useAutoQueue()
  useListeningHistory()
  useRealtimeSync()
  useKeyboardShortcuts()
  useMediaSession()

  const openAuth = () => setAuthModalOpen(true)

  return (
    <div className="h-screen w-screen flex flex-col bg-base text-text-primary relative">
      <div
        className="pointer-events-none fixed inset-0 -z-10 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 15% 10%, var(--ambient-primary, #00FF66)15, transparent 40%),
                       radial-gradient(circle at 85% 90%, var(--ambient-secondary, #1DB954)15, transparent 45%)`,
        }}
      />

      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-surface">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center text-white"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-base font-extrabold tracking-tight text-white">
          BEAT PULSE
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onOpenAuth={openAuth} />
        <Routes>
          <Route
            path="/"
            element={
              <MainView
                onOpenDiscover={() => setMobileDiscoverOpen(true)}
                onOpenAuth={openAuth}
              />
            }
          />
          <Route path="/search" element={<Search />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/library" element={<Library onOpenAuth={openAuth} />} />
          <Route path="/artists" element={<FavoriteArtists onOpenAuth={openAuth} />} />
          <Route path="/liked" element={<LikedSongs onOpenAuth={openAuth} />} />
          <Route path="/playlists" element={<Playlists onOpenAuth={openAuth} />} />
          <Route path="/profile" element={<Profile onOpenAuth={openAuth} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!isMobile && <RightPanel />}
      </div>

      <PlayerBar />
      <PlayerSheet />
      <FocusMode />
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onOpenAuth={openAuth}
      />
      <RightPanelSheet
        isOpen={mobileDiscoverOpen}
        onClose={() => setMobileDiscoverOpen(false)}
      />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ToastProvider>
  )
}