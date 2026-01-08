// lib/hooks/useAsync.ts
'use client'

import { useEffect, useRef, useState } from 'react'

export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    fnRef
      .current()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, deps)

  return { data, error, loading }
}
