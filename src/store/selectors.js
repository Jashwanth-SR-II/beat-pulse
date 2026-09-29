import { usePlayerStore } from './playerStore'

export const useCurrentTrack = () => usePlayerStore((s) => s.currentTrack)
export const useIsPlaying = () => usePlayerStore((s) => s.isPlaying)
export const useQueue = () => usePlayerStore((s) => s.queue)
export const useVolume = () => usePlayerStore((s) => s.volume)
export const useCurrentTime = () => usePlayerStore((s) => s.currentTime)
export const useDuration = () => usePlayerStore((s) => s.duration)
export const useRepeatMode = () => usePlayerStore((s) => s.repeatMode)
export const useShuffle = () => usePlayerStore((s) => s.shuffle)
export const useIsFocusMode = () => usePlayerStore((s) => s.isFocusMode)
export const useActiveGenre = () => usePlayerStore((s) => s.activeGenre)
export const usePalette = () => usePlayerStore((s) => s.palette)