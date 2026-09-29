import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { useCurrentTrack } from '../store/selectors'
import { extractPalette, applyPaletteToCSS } from '../lib/colorExtractor'

export function useAdaptivePalette() {
  const currentTrack = useCurrentTrack()
  const setPalette = usePlayerStore((s) => s.setPalette)

  useEffect(() => {
    if (!currentTrack?.artwork) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      // Skip color extraction entirely on reduced motion
      return
    }

    let cancelled = false

    extractPalette(currentTrack.artwork).then((palette) => {
      if (cancelled) return
      setPalette(palette)
      applyPaletteToCSS(palette)
    })

    return () => {
      cancelled = true
    }
  }, [currentTrack?.id, currentTrack?.artwork, setPalette])
}