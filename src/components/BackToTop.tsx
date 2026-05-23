'use client'

import { usePathname } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const HOME_ROUTE_RE = /^\/(en|zh)\/?$/

export function BackToTop() {
  const pathname = usePathname()
  const isHomePage = pathname === '/' || HOME_ROUTE_RE.test(pathname)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isHomePage) {
      setIsVisible(false)
      return
    }

    const updateVisibility = () => {
      setIsVisible(window.scrollY > 360)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateVisibility)
    }
  }, [isHomePage, pathname])

  if (isHomePage) return null

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <button
      aria-label="Back to top"
      className={`group fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border border-black/[0.08] bg-white px-3 py-2 text-foreground/72 shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.12] hover:text-foreground dark:border-white/[0.07] dark:bg-[#0a0e12] dark:text-white/66 dark:shadow-[0_10px_24px_rgba(0,0,0,0.18)] dark:hover:border-white/[0.14] dark:hover:text-white ${
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      onClick={handleClick}
      type="button"
    >
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-black/[0.08] bg-black/[0.03] dark:border-white/[0.08] dark:bg-white/[0.03]">
        <span className="absolute inset-y-[22%] left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-[#ff8f72]/0 via-[#ff8f72]/50 to-[#7dd7ff]/75 dark:from-[#ff8f72]/10 dark:via-[#ff8f72]/55 dark:to-[#7dd7ff]/80" />
        <ArrowUp
          aria-hidden="true"
          className="relative h-3.5 w-3.5 -translate-y-[1px] transition-transform duration-300 group-hover:-translate-y-0.5"
          strokeWidth={1.8}
        />
      </span>
      <span
        aria-hidden="true"
        className="font-mono text-[0.64rem] uppercase tracking-[0.28em] text-current/78"
      >
        Top
      </span>
    </button>
  )
}
