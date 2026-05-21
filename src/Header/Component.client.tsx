'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

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

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      data-site-header
      className={`z-20 ${isHomePage ? 'home-header absolute inset-x-0 top-0' : 'relative'}`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div
        className={`container flex justify-between ${
          isHomePage ? 'items-start py-7 sm:py-8' : 'items-center py-8'
        }`}
      >
        <Link className="flex items-center" href="/">
          <Logo className={isHomePage ? 'home-header-logo' : undefined} variant="signal" />
        </Link>
        <HeaderNav data={data} isHomePage={isHomePage} />
      </div>
    </header>
  )
}
