/**
 * Parse LRC format lyrics into an array of { time, text }.
 * Supports [mm:ss.xx] and [mm:ss.xxx] timestamps, plus multiline.
 */
export function parseLRC(lrc) {
  if (!lrc || typeof lrc !== 'string') return []

  const lines = lrc.split(/\r?\n/)
  const result = []
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g

  for (const line of lines) {
    const times = []
    let match
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0
      times.push(minutes * 60 + seconds + ms / 1000)
    }

    const text = line.replace(timeRegex, '').trim()
    if (times.length === 0 || !text) continue

    for (const time of times) {
      result.push({ time, text })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

/**
 * Fetch lyrics for a track. Tries LRCLIB first (public, no key).
 * Returns array of { time, text } or [] if none found.
 */
export async function fetchLyrics({ title, artist, duration }) {
  if (!title || !artist) return []

  try {
    const params = new URLSearchParams({
      track_name: title,
      artist_name: artist,
    })
    if (duration) params.set('duration', Math.round(duration))

    const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`)
    if (!res.ok) return []

    const data = await res.json()
    const raw = data?.syncedLyrics || data?.plainLyrics
    if (!raw) return []

    if (data.syncedLyrics) return parseLRC(data.syncedLyrics)
    // Plain lyrics: no timestamps, spread evenly as fallback
    const lines = raw.split(/\r?\n/).filter(Boolean)
    return lines.map((text, i) => ({ time: i * 5, text }))
  } catch (err) {
    console.warn('Lyrics fetch failed:', err)
    return []
  }
}

/**
 * Given a time (seconds) and sorted lyrics, return the active line index.
 */
export function getActiveLyricIndex(lyrics, time) {
  if (!lyrics.length) return -1
  let lo = 0
  let hi = lyrics.length - 1
  let result = -1

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (lyrics[mid].time <= time) {
      result = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return result
}
