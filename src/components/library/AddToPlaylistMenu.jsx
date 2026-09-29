import { useEffect, useRef, useState } from 'react'
import { ListPlus, Plus, Check } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLibraryStore } from '../../store/libraryStore'

export default function AddToPlaylistMenu({ track, onRequireAuth }) {
  const user = useAuthStore((s) => s.user)
  const playlists = useLibraryStore((s) => s.playlists)
  const createPlaylist = useLibraryStore((s) => s.createPlaylist)
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist)
  const loadPlaylists = useLibraryStore((s) => s.loadPlaylists)

  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [addedTo, setAddedTo] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (open && user && playlists.length === 0) {
      loadPlaylists(user.id)
    }
  }, [open, user])

  const handleAdd = async (playlistId) => {
    await addToPlaylist(playlistId, track)
    setAddedTo(playlistId)
    setTimeout(() => {
      setAddedTo(null)
      setOpen(false)
    }, 900)
  }

  const handleCreate = async () => {
    if (!newName.trim() || !user) return
    const created = await createPlaylist(user.id, { name: newName.trim() })
    if (!created) return
    await addToPlaylist(created.id, track)
    setNewName('')
    setCreating(false)
    setAddedTo(created.id)
    setTimeout(() => {
      setAddedTo(null)
      setOpen(false)
    }, 900)
  }

  if (!user) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRequireAuth?.()
        }}
        className="text-text-secondary hover:text-accent transition"
        title="Sign in to add to playlist"
      >
        <ListPlus className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="text-text-secondary hover:text-accent transition"
        title="Add to playlist"
      >
        <ListPlus className="w-4 h-4" />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-8 z-20 w-56 bg-card border border-white/10 rounded-xl shadow-2xl py-2"
        >
          <p className="px-3 pb-2 text-xs uppercase tracking-wider text-text-muted">
            Add to playlist
          </p>

          {playlists.length === 0 && !creating && (
            <p className="px-3 py-2 text-sm text-text-muted">No playlists yet</p>
          )}

          <div className="max-h-56 overflow-y-auto">
            {playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAdd(p.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition"
              >
                <span className="truncate">{p.name}</span>
                {addedTo === p.id && <Check className="w-4 h-4 text-accent" />}
              </button>
            ))}
          </div>

          {creating ? (
            <div className="px-3 pt-2 border-t border-white/5 mt-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Playlist name"
                className="w-full bg-surface border border-white/10 rounded-lg px-2 py-1.5 text-sm
                           focus:outline-none focus:border-accent/40"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleCreate}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-accent text-black font-semibold"
                >
                  Create
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 text-text-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-accent
                         border-t border-white/5 hover:bg-white/5 transition"
            >
              <Plus className="w-4 h-4" />
              New playlist
            </button>
          )}
        </div>
      )}
    </div>
  )
}