import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'
import {
  useCurrentTrack,
  useIsPlaying,
  useQueue,
  useCurrentTime,
  useDuration,
} from '../store/selectors'
import { buildAutoQueue } from '../lib/autoQueue'

/**
 * Watch the player state and refill the queue when:
 *   - The queue is running low (≤ 2 tracks remaining)
 *   - A track is currently playing
 *   - We're within the last 20 seconds of the current track
 */
export function useAutoQueue() {
  const currentTrack = useCurrentTrack()
  const isPlaying = useIsPlaying()
  const queue = useQueue()
  const currentTime = useCurrentTime()
  const duration = useDuration()

  const isBuildingRef = useRef(false)

  useEffect(() => {
    if (!currentTrack || !isPlaying) return
    if (queue.length > 2) return
    if (isBuildingRef.current) return

    // Only trigger near the end of the track, or if queue is empty
    const nearEnd = duration > 0 && currentTime > duration - 20
    const queueEmpty = queue.length === 0

    if (!nearEnd && !queueEmpty) return

    isBuildingRef.current = true

    ;(async () => {
      try {
        const { history } = usePlayerStore.getState()
        const recentIds = history.slice(0, 20).map((t) => t.id)

        const newTracks = await buildAutoQueue(currentTrack, recentIds, 10)

        if (newTracks.length > 0) {
          usePlayerStore.setState({ queue: [...queue, ...newTracks] })
        }
      } catch (err) {
        console.warn('[useAutoQueue] failed:', err)
      } finally {
        isBuildingRef.current = false
      }
    })()
  }, [currentTrack?.id, currentTime, queue.length, isPlaying, duration])
}
