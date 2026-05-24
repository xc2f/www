'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const isHomePage = pathname === '/' || /^\/(en|zh)\/?$/.test(pathname)
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const header = headerRef.current
    const body = document.body

    if (!header || !isHomePage) {
      body.style.removeProperty('--home-header-height')
      return
    }

    const syncHeaderHeight = () => {
      body.style.setProperty('--home-header-height', `${header.offsetHeight}px`)
    }

    syncHeaderHeight()

    const observer = new ResizeObserver(syncHeaderHeight)
    observer.observe(header)

    return () => {
      observer.disconnect()
      body.style.removeProperty('--home-header-height')
    }
  }, [isHomePage])

  return (
    <header
      ref={headerRef}
      data-site-header
      className={`z-20 ${isHomePage ? 'home-header absolute inset-x-0 top-0' : 'relative'}`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div
        className={`container flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-nowrap ${
          isHomePage ? 'py-7 sm:py-8' : 'py-6 sm:py-8'
        }`}
      >
        <Link className="flex shrink-0 items-center" href="/">
          <Logo className={isHomePage ? 'home-header-logo' : undefined} variant="signal" />
        </Link>
        <HeaderNav data={data} isHomePage={isHomePage} />
      </div>
    </header>
  )
}
