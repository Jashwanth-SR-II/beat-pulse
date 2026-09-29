import { useEffect } from 'react'
import { User as UserIcon, LogOut, Music2, Heart, ListMusic } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLibraryStore } from '../store/libraryStore'

export default function Profile({ onOpenAuth }) {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const topArtists = useLibraryStore((s) => s.topArtists)
  const recentHistory = useLibraryStore((s) => s.recentHistory)
  const likedTracks = useLibraryStore((s) => s.likedTracks)
  const loadTopArtists = useLibraryStore((s) => s.loadTopArtists)
  const loadHistory = useLibraryStore((s) => s.loadHistory)
  const loadLikedSongs = useLibraryStore((s) => s.loadLikedSongs)

  useEffect(() => {
    if (!user) return
    loadTopArtists(user.id)
    loadHistory(user.id)
    loadLikedSongs(user.id)
  }, [user])

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base px-4">
        <div className="text-center max-w-md">
          <UserIcon className="w-12 h-12 mx-auto mb-4 text-accent opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to view your profile
          </h2>
          <p className="text-text-muted mb-6">
            Create a free account to track your listening stats, liked songs, and top artists.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 rounded-full bg-accent text-black font-semibold
                       hover:scale-105 transition"
          >
            Sign In
          </button>
        </div>
      </main>
    )
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User'

  return (
    <main className="flex-1 overflow-y-auto bg-base px-4 md:px-8 py-6 md:py-8">
      <header className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-accent to-emerald-600
                        flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
          <UserIcon className="w-8 h-8 md:w-10 md:h-10 text-black" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Profile</p>
          <h1 className="text-2xl md:text-4xl font-extrabold truncate text-white">
            {username}
          </h1>
          <p className="text-sm text-text-secondary mt-1 truncate">{user.email}</p>
          <button
            onClick={signOut}
            className="mt-3 md:mt-4 flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <section className="mb-8 md:mb-10">
        <h2 className="text-base md:text-lg font-bold mb-4 text-white">Your Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <StatCard icon={Heart} label="Liked songs" value={likedTracks.length} />
          <StatCard icon={Music2} label="Recent plays" value={recentHistory.length} />
          <StatCard icon={ListMusic} label="Top artists" value={topArtists.length} />
        </div>
      </section>

      <section>
        <h2 className="text-base md:text-lg font-bold mb-4 text-white">Top Artists</h2>
        {topArtists.length === 0 ? (
          <p className="text-text-muted text-sm">Play more tracks to see your top artists.</p>
        ) : (
          <div className="flex flex-wrap gap-3 md:gap-4">
            {topArtists.map((a, i) => (
              <div
                key={`${a.artist}-${i}`}
                className="flex flex-col items-center gap-2 w-16 md:w-20"
              >
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-accent to-emerald-600
                             flex items-center justify-center text-black font-bold text-lg
                             shadow-lg shadow-accent/20"
                >
                  {a.artist.charAt(0).toUpperCase()}
                </div>
                <span className="text-[11px] md:text-xs text-center text-text-secondary truncate w-full">
                  {a.artist}
                </span>
                <span className="text-[10px] text-text-muted">{a.play_count} plays</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-4 md:p-5">
      <Icon className="w-5 h-5 text-accent mb-3" />
      <p className="text-2xl md:text-3xl font-extrabold text-white">{value}</p>
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
    </div>
  )
}