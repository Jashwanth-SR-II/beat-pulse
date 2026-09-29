import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { seekAudio } from '../lib/audioEngine'

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e) => {
      // Ignore if user is typing in an input/textarea/contenteditable
      const el = document.activeElement
      const tag = el?.tagName?.toLowerCase()
      const isEditable =
        tag === 'input' ||
        tag === 'textarea' ||
        el?.isContentEditable

      // '/' focuses the search bar even when not editable
      if (e.key === '/' && !isEditable) {
        e.preventDefault()
        const searchInput = document.querySelector('[data-search-input]')
        searchInput?.focus()
        return
      }

      if (isEditable) return

      const state = usePlayerStore.getState()

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          state.togglePlay()
          break

        case 'ArrowRight':
          if (e.shiftKey) {
            e.preventDefault()
            state.playNext()
          } else {
            e.preventDefault()
            seekAudio(Math.min(state.currentTime + 5, state.duration))
          }
          break

        case 'ArrowLeft':
          if (e.shiftKey) {
            e.preventDefault()
            state.playPrevious()
          } else {
            e.preventDefault()
            seekAudio(Math.max(state.currentTime - 5, 0))
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          state.setVolume(Math.min(state.volume + 0.05, 1))
          break

        case 'ArrowDown':
          e.preventDefault()
          state.setVolume(Math.max(state.volume - 0.05, 0))
          break

        case 'm':
        case 'M':
          e.preventDefault()
          state.toggleMute()
          break

        case 'f':
        case 'F':
          e.preventDefault()
          state.isFocusMode ? state.exitFocusMode() : state.enterFocusMode()
          break

        case 's':
        case 'S':
          e.preventDefault()
          state.toggleShuffle()
          break

        case 'r':
        case 'R':
          e.preventDefault()
          state.toggleRepeat()
          break

        case 'Escape':
          if (state.isFocusMode) {
            e.preventDefault()
            state.exitFocusMode()
          }
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
