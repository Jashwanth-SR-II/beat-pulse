import { useEffect, useRef, useState } from 'react'
import { searchAll } from '../lib/search'

const DEBOUNCE_MS = 350

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const timerRef = useRef(null)
  const abortRef = useRef(0)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)

    timerRef.current = setTimeout(async () => {
      const requestId = ++abortRef.current
      try {
        const data = await searchAll(query)
        if (requestId !== abortRef.current) return // stale
        setResults(data.results || [])
        setError(null)
      } catch (err) {
        if (requestId !== abortRef.current) return
        setError(err.message)
        setResults([])
      } finally {
        if (requestId === abortRef.current) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  return { query, setQuery, results, loading, error }
}
