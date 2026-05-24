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
      className={`group fixed bottom-4 right-4 z-40 inline-flex items-center gap-0 rounded-full px-2 py-2 text-white [mix-blend-mode:difference] transition-all duration-300 hover:-translate-y-0.5 sm:bottom-5 sm:right-5 sm:gap-2.5 sm:px-2.5 ${
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      onClick={handleClick}
      type="button"
    >
      <ArrowUp
        aria-hidden="true"
        className="h-4 w-4 -translate-y-[1px] transition-transform duration-300 group-hover:-translate-y-0.5"
        strokeWidth={1.7}
      />
      <span
        aria-hidden="true"
        className="hidden font-mono text-[0.6rem] uppercase tracking-[0.24em] text-current/72 sm:inline"
      >
        Top
      </span>
    </button>
  )
}
