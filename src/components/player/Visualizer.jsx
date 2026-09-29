import { useEffect, useRef } from 'react'
import { getAnalyser } from '../../lib/audioEngine'
import { useIsPlaying } from '../../store/selectors'

export default function Visualizer({
  barCount = 48,
  barWidth = 3,
  barGap = 2,
  color = '#00FF66',
  height = 40,
  mirrored = false,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const isPlaying = useIsPlaying()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const width = barCount * (barWidth + barGap) - barGap

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const dataArray = new Uint8Array(128) // matches analyser.frequencyBinCount default

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      const analyser = getAnalyser()

      // If no analyser yet or paused, draw idle bars
      if (!analyser || !isPlaying) {
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = color + '30'
        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + barGap)
          const idleHeight = 3
          const y = mirrored ? (height - idleHeight) / 2 : height - idleHeight
          ctx.fillRect(x, y, barWidth, idleHeight)
        }
        return
      }

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, width, height)

      // Sample evenly across the useful part of the spectrum (~ first half)
      const step = Math.floor((dataArray.length * 0.7) / barCount)

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255 // 0..1
        const barHeight = Math.max(2, value * height)

        const x = i * (barWidth + barGap)
        const y = mirrored ? (height - barHeight) / 2 : height - barHeight

        // Vertical gradient for glow effect
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, color + '40')

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, barHeight)
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [barCount, barWidth, barGap, color, height, mirrored, isPlaying])

  return <canvas ref={canvasRef} className="pointer-events-none" />
}
