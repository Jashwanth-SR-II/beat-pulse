import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { playNow, loadSource } from '../lib/audioEngine'

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      // STATE
      currentTrack: null,
      queue: [],
      history: [],
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      repeatMode: 'off',
      shuffle: false,
      isFocusMode: false,
      activeGenre: null,
      palette: null,

      // PLAYBACK
      playTrack: (track, contextQueue = null) => {
        const { currentTrack, history } = get()

        const newHistory = currentTrack
          ? [currentTrack, ...history].slice(0, 50)
          : history

        const newQueue = contextQueue
          ? contextQueue.filter((t) => t.id !== track.id)
          : get().queue

        set({
          currentTrack: track,
          queue: newQueue,
          history: newHistory,
          isPlaying: true,
          currentTime: 0,
          duration: track.duration || 0,
        })

        loadSource(track.audio)
        playNow()
      },

      togglePlay: () => {
        const { currentTrack, isPlaying } = get()
        if (!currentTrack) return
        const next = !isPlaying
        set({ isPlaying: next })
        if (next) playNow()
      },

      playNext: () => {
        const { queue, repeatMode, currentTrack, history } = get()

        if (queue.length === 0) {
          if (repeatMode === 'one') {
            set({ currentTime: 0, isPlaying: true })
            playNow()
            return
          }
          if (repeatMode === 'all' && history.length > 0) {
            const [next, ...rest] = history
            set({
              currentTrack: next,
              queue: rest,
              history: currentTrack ? [currentTrack, ...history.slice(1)] : history,
              currentTime: 0,
              duration: next.duration || 0,
              isPlaying: true,
            })
            loadSource(next.audio)
            playNow()
            return
          }
          // Queue empty and repeat is off — pause. useAutoQueue will refill.
          set({ isPlaying: false })
          return
        }

        const [next, ...rest] = queue
        set({
          currentTrack: next,
          queue: rest,
          history: currentTrack ? [currentTrack, ...history].slice(0, 50) : history,
          currentTime: 0,
          duration: next.duration || 0,
          isPlaying: true,
        })
        loadSource(next.audio)
        playNow()
      },

      playPrevious: () => {
        const { history, currentTrack, currentTime } = get()

        if (currentTime > 3) {
          set({ currentTime: 0 })
          return
        }
        if (history.length === 0) {
          set({ currentTime: 0 })
          return
        }

        const [prev, ...rest] = history
        set({
          currentTrack: prev,
          queue: currentTrack ? [currentTrack, ...get().queue] : get().queue,
          history: rest,
          currentTime: 0,
          duration: prev.duration || 0,
          isPlaying: true,
        })
        loadSource(prev.audio)
        playNow()
      },

      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),
      seek: (seconds) => set({ currentTime: seconds }),

      setVolume: (v) => {
        const clamped = Math.max(0, Math.min(1, v))
        set({ volume: clamped, isMuted: clamped === 0 })
      },

      toggleMute: () => {
        const { isMuted, volume } = get()
        if (isMuted && volume === 0) {
          set({ volume: 0.5, isMuted: false })
        } else {
          set({ isMuted: !isMuted })
        }
      },

      addToQueue: (track) => {
        const { queue, currentTrack } = get()
        if (currentTrack?.id === track.id) return
        if (queue.some((t) => t.id === track.id)) return
        set({ queue: [...queue, track] })
      },

      addManyToQueue: (tracks) => {
        const { queue, currentTrack } = get()
        const existing = new Set(queue.map((t) => t.id))
        if (currentTrack) existing.add(currentTrack.id)
        const filtered = tracks.filter((t) => !existing.has(t.id))
        set({ queue: [...queue, ...filtered] })
      },

      removeFromQueue: (index) => {
        const { queue } = get()
        set({ queue: queue.filter((_, i) => i !== index) })
      },

      clearQueue: () => set({ queue: [] }),

      setRepeat: (mode) => set({ repeatMode: mode }),

      toggleRepeat: () => {
        const order = ['off', 'all', 'one']
        const { repeatMode } = get()
        const next = order[(order.indexOf(repeatMode) + 1) % order.length]
        set({ repeatMode: next })
      },

      toggleShuffle: () => {
        const { shuffle, queue } = get()
        if (!shuffle && queue.length > 1) {
          const shuffled = [...queue].sort(() => Math.random() - 0.5)
          set({ shuffle: true, queue: shuffled })
        } else {
          set({ shuffle: !shuffle })
        }
      },

      enterFocusMode: () => set({ isFocusMode: true }),
      exitFocusMode: () => set({ isFocusMode: false }),

      setActiveGenre: (genre) => set({ activeGenre: genre }),
      setPalette: (palette) => set({ palette }),
    }),
    {
      name: 'beat-pulse-player',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        shuffle: state.shuffle,
      }),
    }
  )
)