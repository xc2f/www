'use client'

import { X } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useRef, useState } from 'react'

export function SearchField({
  query,
  placeholder,
  clearLabel,
}: {
  query: string
  placeholder: string
  clearLabel: string
}) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    const field = input.current
    if (field) {
      field.focus({ preventScroll: true })
      const end = field.value.length
      field.setSelectionRange(end, end)
    }
  }, [])
  useEffect(() => {
    if (input.current) input.current.value = query
  }, [query])

  return (
    <div className="archive-search-field" data-clear-ready={ready}>
      <input
        ref={input}
        id="archive-search-query"
        type="search"
        name="q"
        defaultValue={query}
        placeholder={placeholder}
      />
      <button
        className="archive-search-clear"
        hidden={!ready}
        type="button"
        aria-label={clearLabel}
        onClick={() => {
          if (!input.current) return
          input.current.value = ''
          input.current.focus()
          if (query) router.replace('/search', { scroll: false })
        }}
      >
        <X aria-hidden="true" size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
