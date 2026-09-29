import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { useCurrentTrack, useIsPlaying } from '../store/selectors'

export function useMediaSession() {
  const currentTrack = useCurrentTrack()
  const isPlaying = useIsPlaying()

  // Set metadata when track changes
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (!currentTrack) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || 'Unknown',
      artist: currentTrack.artist || 'Unknown',
      album: currentTrack.album || '',
      artwork: currentTrack.artwork
        ? [
            { src: currentTrack.artwork, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    })
  }, [currentTrack?.id])

  // Set playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  // Register action handlers once
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    const state = () => usePlayerStore.getState()

    const handlers = {
      play: () => state().togglePlay(),
      pause: () => state().togglePlay(),
      previoustrack: () => state().playPrevious(),
      nexttrack: () => state().playNext(),
      seekbackward: (details) => {
        const s = state()
        seekTo(s.currentTime - (details?.seekOffset || 10))
      },
      seekforward: (details) => {
        const s = state()
        seekTo(s.currentTime + (details?.seekOffset || 10))
      },
      seekto: (details) => {
        if (details?.seekTime != null) seekTo(details.seekTime)
      },
    }

    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // Some actions aren't supported on all browsers
      }
    }

    return () => {
      for (const action of Object.keys(handlers)) {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch {}
      }
    }
  }, [])
}

function seekTo(seconds) {
  import('../lib/audioEngine').then(({ seekAudio }) => {
    const s = usePlayerStore.getState()
    seekAudio(Math.max(0, Math.min(seconds, s.duration)))
  })
}
