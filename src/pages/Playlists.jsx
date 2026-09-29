import { useEffect, useState } from 'react'
import { Plus, Trash2, Music, ArrowLeft, ListMusic } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLibraryStore } from '../store/libraryStore'
import { getPlaylistWithTracks } from '../lib/library'
import { usePlayerStore } from '../store/playerStore'
import { useCurrentTrack } from '../store/selectors'
import TrackRow from '../components/cards/TrackRow'

export default function Playlists({ onOpenAuth }) {
  const user = useAuthStore((s) => s.user)
  const playlists = useLibraryStore((s) => s.playlists)
  const loadPlaylists = useLibraryStore((s) => s.loadPlaylists)
  const createPlaylist = useLibraryStore((s) => s.createPlaylist)
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const currentTrack = useCurrentTrack()

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [mobileDetail, setMobileDetail] = useState(false)

  useEffect(() => {
    if (user) loadPlaylists(user.id)
  }, [user])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    getPlaylistWithTracks(selectedId).then(setDetail).catch(console.warn)
  }, [selectedId])

  const handleCreate = async () => {
    if (!newName.trim() || !user) return
    const created = await createPlaylist(user.id, { name: newName.trim() })
    if (!created) return
    setNewName('')
    setCreating(false)
    setSelectedId(created.id)
    setMobileDetail(true)
  }

  const handleSelect = (id) => {
    setSelectedId(id)
    setMobileDetail(true)
  }

  const handleBack = () => {
    setMobileDetail(false)
  }

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base px-4">
        <div className="text-center max-w-md">
          <ListMusic className="w-12 h-12 mx-auto mb-4 text-accent opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to create playlists
          </h2>
          <p className="text-text-muted mb-6">
            Playlists let you organize your favorite tracks into collections.
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

  const showSidebar = !mobileDetail
  const showDetail = mobileDetail

  return (
    <main className="flex-1 overflow-hidden bg-base flex">
      <div
        className={`${showSidebar ? 'flex' : 'hidden'} md:flex
                    w-full md:w-72 border-r border-white/5 overflow-y-auto p-4 flex-col`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Playlists</h2>
          <button
            onClick={() => setCreating((v) => !v)}
            className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"
            aria-label="Create playlist"
          >
            <Plus className="w-4 h-4 text-black" />
          </button>
        </div>

        {creating && (
          <div className="mb-3">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Playlist name"
              className="w-full bg-card border border-white/10 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:border-accent/40"
            />
          </div>
        )}

        <div className="space-y-1">
          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-left
                ${selectedId === p.id ? 'bg-accent/10 text-accent' : 'hover:bg-card'}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-xs text-text-muted">{p.track_count} tracks</p>
              </div>
              <Trash2
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete "${p.name}"?`)) {
                    deletePlaylist(user.id, p.id)
                    if (selectedId === p.id) {
                      setSelectedId(null)
                      setMobileDetail(false)
                    }
                  }
                }}
                className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-red-400"
              />
            </button>
          ))}
          {playlists.length === 0 && !creating && (
            <p className="text-sm text-text-muted text-center py-8">
              No playlists yet. Click + to create one.
            </p>
          )}
        </div>
      </div>

      <div
        className={`${showDetail ? 'flex' : 'hidden'} md:flex
                    flex-1 overflow-y-auto p-4 md:p-8 flex-col`}
      >
        {!detail && (
          <div className="h-full flex items-center justify-center text-text-muted">
            <div className="text-center">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Select a playlist to view its tracks</p>
            </div>
          </div>
        )}

        {detail && (
          <>
            <button
              onClick={handleBack}
              className="md:hidden flex items-center gap-2 text-sm text-text-secondary mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to playlists
            </button>

            <div className="mb-6 md:mb-8">
              <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Playlist</p>
              <h1 className="text-2xl md:text-4xl font-extrabold mb-2 text-white">
                {detail.name}
              </h1>
              {detail.description && (
                <p className="text-sm text-text-secondary">{detail.description}</p>
              )}
              <p className="text-sm text-text-muted mt-2">{detail.tracks.length} tracks</p>
            </div>

            {detail.tracks.length === 0 ? (
              <p className="text-text-muted">This playlist is empty.</p>
            ) : (
              <div className="space-y-1">
                {detail.tracks.map((t, i) => (
                  <TrackRow
                    key={t.id}
                    index={i + 1}
                    {...t}
                    track={t}
                    isActive={currentTrack?.id === t.id}
                    onPlay={() => playTrack(t, detail.tracks.slice(i + 1))}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}