import { useEffect, useRef, useState } from 'react'
import { useCurrentTime, useCurrentTrack, useDuration } from '../../store/selectors'
import { fetchLyrics, getActiveLyricIndex } from '../../lib/lrc'
import { seekAudio } from '../../lib/audioEngine'

export default function LyricsPanel() {
  const currentTrack = useCurrentTrack()
  const currentTime = useCurrentTime()
  const duration = useDuration()

  const [lyrics, setLyrics] = useState([])
  const [loading, setLoading] = useState(false)

  const lineRefs = useRef([])

  useEffect(() => {
    if (!currentTrack) {
      setLyrics([])
      return
    }

    let cancelled = false
    setLoading(true)

    fetchLyrics({
      title: currentTrack.title,
      artist: currentTrack.artist,
      duration: currentTrack.duration || duration,
    }).then((result) => {
      if (cancelled) return
      setLyrics(result)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [currentTrack?.id])

  const activeIndex = getActiveLyricIndex(lyrics, currentTime)

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeIndex < 0) return
    const el = lineRefs.current[activeIndex]
    if (!el) return

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [activeIndex])

  if (loading) {
    return (
      <div className="text-text-muted text-sm animate-pulse">
        Loading lyrics…
      </div>
    )
  }

  if (!lyrics.length) {
    return (
      <div className="text-text-muted text-sm italic">
        No synced lyrics available for this track.
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="space-y-2 md:space-y-3 py-20 md:py-40 pl-2 pr-3 md:pr-4">
        {lyrics.map((line, i) => {
          const isActive = i === activeIndex
          const isPast = i < activeIndex
          return (
            <button
              key={i}
              ref={(el) => (lineRefs.current[i] = el)}
              onClick={() => seekAudio(line.time)}
              className={`block w-full text-left text-base md:text-xl font-semibold leading-snug
                origin-left transition-all duration-300
                ${isActive
                  ? 'text-white scale-105'
                  : isPast
                  ? 'text-white/30'
                  : 'text-white/50 hover:text-white/80'
                }`}
            >
              {line.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}