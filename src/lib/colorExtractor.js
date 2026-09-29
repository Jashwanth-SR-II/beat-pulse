import { getPalette } from 'colorthief'

const FALLBACK = {
  primary: '#00FF66',
  secondary: '#1DB954',
  dark: '#0B0B0E',
  muted: '#121216',
}

function rgbToHex(rgb) {
  return (
    '#' +
    rgb
      .map((v) => {
        const hex = Math.max(0, Math.min(255, Math.round(v))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

function darken(hex, amount = 0.6) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  const factor = 1 - amount
  const nr = Math.round(r * factor)
  const ng = Math.round(g * factor)
  const nb = Math.round(b * factor)
  return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`
}

export async function extractPalette(imageUrl) {
  if (!imageUrl) return FALLBACK

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    const timeout = setTimeout(() => resolve(FALLBACK), 5000)

    img.onload = async () => {
      clearTimeout(timeout)
      try {
        // v3 API: getPalette is async and returns an array of color objects
        const palette = await getPalette(img, { colorCount: 5 })

        if (!palette || palette.length === 0) {
          return resolve(FALLBACK)
        }

        // Each entry in v3 palette is an object with .hex() method
        const primary = palette[0].hex()
        const secondary = palette[1] ? palette[1].hex() : darken(primary, 0.3)

        resolve({
          primary,
          secondary,
          dark: darken(primary, 0.75),
          muted: darken(primary, 0.55),
        })
      } catch (err) {
        console.warn('Color extraction failed:', err)
        resolve(FALLBACK)
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve(FALLBACK)
    }
  })
}

export function applyPaletteToCSS(palette) {
  const root = document.documentElement
  root.style.setProperty('--ambient-primary', palette.primary)
  root.style.setProperty('--ambient-secondary', palette.secondary)
  root.style.setProperty('--ambient-dark', palette.dark)
  root.style.setProperty('--ambient-muted', palette.muted)
}