import { usePlayerStore } from '../store/playerStore'

// ============================================
// SINGLETONS (module-level, created once)
// ============================================
let audio = null
let audioContext = null
let analyser = null
let sourceNode = null
let gainNode = null
let initialized = false

// ============================================
// INIT
// ============================================
function initAudioElement() {
  if (audio) return audio

  audio = new Audio()
  audio.crossOrigin = 'anonymous' // Required for ColorThief + Jamendo CORS
  audio.preload = 'metadata'

  audio.addEventListener('timeupdate', () => {
    usePlayerStore.getState().setCurrentTime(audio.currentTime)
  })

  audio.addEventListener('loadedmetadata', () => {
    usePlayerStore.getState().setDuration(audio.duration)
  })

  audio.addEventListener('ended', () => {
    const { repeatMode } = usePlayerStore.getState()
    if (repeatMode === 'one') {
      audio.currentTime = 0
      audio.play()
    } else {
      usePlayerStore.getState().playNext()
    }
  })

  audio.addEventListener('error', (e) => {
    console.error('Audio error:', e)
    usePlayerStore.getState().playNext()
  })

  return audio
}

// ============================================
// WEB AUDIO GRAPH (lazy — needs user gesture)
// ============================================
export async function ensureAudioContext() {
  if (audioContext) {
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    return audioContext
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  audioContext = new AudioContextClass()

  const element = initAudioElement()

  sourceNode = audioContext.createMediaElementSource(element)
  analyser = audioContext.createAnalyser()
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.8

  gainNode = audioContext.createGain()
  gainNode.gain.value = usePlayerStore.getState().isMuted
    ? 0
    : usePlayerStore.getState().volume

  sourceNode.connect(analyser)
  analyser.connect(gainNode)
  gainNode.connect(audioContext.destination)

  return audioContext
}

export function getAnalyser() {
  return analyser
}

export function getAudioContext() {
  return audioContext
}

// ============================================
// DIRECT PLAY HELPERS (called from store actions)
// ============================================

/**
 * Set the source of the audio element without triggering playback.
 * Safe to call repeatedly with the same URL — will no-op.
 */
export function loadSource(url) {
  const el = initAudioElement()
  if (!url) return
  if (el.src !== url) {
    el.src = url
    el.currentTime = 0
  }
}

/**
 * Start playback on the current source. Ensures the AudioContext is
 * running (creates it on first call within a user gesture).
 */
export function playNow() {
  if (!audio?.src) return
  ensureAudioContext().then(() => {
    audio.play().catch((err) => {
      console.warn('Direct play failed:', err)
      // Retry on next click if autoplay was blocked
      const retry = () => {
        audio.play().catch(() => {})
        document.removeEventListener('click', retry)
      }
      document.addEventListener('click', retry, { once: true })
    })
  })
}

/**
 * Seek the audio element directly. Used by the scrub bar.
 */
export function seekAudio(seconds) {
  if (!audio) return
  audio.currentTime = seconds
  usePlayerStore.getState().setCurrentTime(seconds)
}

/**
 * Unlock audio on the first user gesture (click, keypress, touch).
 * Required by Chrome/Safari autoplay policies. Idempotent.
 */
let isUnlocked = false
export function unlockAudioOnFirstGesture() {
  if (isUnlocked) return
  isUnlocked = true

  const unlock = async () => {
    try {
      await ensureAudioContext()
      const ctx = getAudioContext()
      if (ctx) {
        // Silent buffer to fully unlock Safari
        const buffer = ctx.createBuffer(1, 1, 22050)
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start(0)
      }
    } catch (err) {
      console.warn('Audio unlock failed:', err)
    } finally {
      document.removeEventListener('click', unlock)
      document.removeEventListener('keydown', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }

  document.addEventListener('click', unlock, { once: true })
  document.addEventListener('keydown', unlock, { once: true })
  document.addEventListener('touchstart', unlock, { once: true })
}

// ============================================
// STORE SUBSCRIPTION
// ============================================
function attachStoreSubscription() {
  let prevTrackId = null
  let prevIsPlaying = false
  let prevVolume = 1
  let prevIsMuted = false

  usePlayerStore.subscribe((state) => {
    // ---- Track changed: swap source and play ----
    if (state.currentTrack?.id !== prevTrackId) {
      prevTrackId = state.currentTrack?.id ?? null

      if (!state.currentTrack?.audio) {
        audio?.pause()
        return
      }

      if (audio.src !== state.currentTrack.audio) {
        audio.src = state.currentTrack.audio
        audio.currentTime = 0
      }

      if (state.isPlaying) {
        ensureAudioContext().then(() => {
          audio.play().catch((err) => {
            console.warn('Autoplay blocked:', err)
          })
        })
      }
    }

    // ---- Play / pause changed ----
    if (state.isPlaying !== prevIsPlaying) {
      prevIsPlaying = state.isPlaying

      if (state.isPlaying && audio?.src) {
        ensureAudioContext().then(() => {
          audio.play().catch((err) => console.warn('Play failed:', err))
        })
      } else {
        audio?.pause()
      }
    }

    // ---- Volume changed ----
    if (state.volume !== prevVolume || state.isMuted !== prevIsMuted) {
      prevVolume = state.volume
      prevIsMuted = state.isMuted

      const effective = state.isMuted ? 0 : state.volume
      if (audio) audio.volume = effective
      if (gainNode) gainNode.gain.value = effective
    }
  })

  // ---- Seek watcher ----
  usePlayerStore.subscribe(
    (state) => state.currentTime,
    (storeTime) => {
      if (!audio) return
      if (Math.abs(audio.currentTime - storeTime) > 1) {
        audio.currentTime = storeTime
      }
    }
  )
}

// ============================================
// PUBLIC INIT
// ============================================
export function initializeAudioEngine() {
  if (initialized) return
  initialized = true
  initAudioElement()
  attachStoreSubscription()
}