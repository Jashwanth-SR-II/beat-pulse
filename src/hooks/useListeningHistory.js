import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { usePlayerStore } from '../store/playerStore'
import { logPlay } from '../lib/library'
import { useCurrentTrack, useCurrentTime, useDuration, useIsPlaying } from '../store/selectors'

const LOG_THRESHOLD = 30 // seconds

export function useListeningHistory() {
  const user = useAuthStore((s) => s.user)
  const currentTrack = useCurrentTrack()
  const currentTime = useCurrentTime()
  const duration = useDuration()
  const isPlaying = useIsPlaying()

  const loggedRef = useRef(new Set())

  useEffect(() => {
    if (!user || !currentTrack || !isPlaying) return

    const key = `${currentTrack.id}-${Math.floor(Date.now() / 60000)}`
    if (loggedRef.current.has(key)) return

    const shouldLog = currentTime >= LOG_THRESHOLD

    if (shouldLog) {
      loggedRef.current.add(key)
      const completed = duration > 0 && currentTime >= duration - 5
      logPlay(user.id, currentTrack.id, Math.floor(currentTime), completed)
    }
  }, [user, currentTrack?.id, currentTime, isPlaying, duration])

  // Reset logged keys when track changes
  useEffect(() => {
    loggedRef.current = new Set()
  }, [currentTrack?.id])
}
