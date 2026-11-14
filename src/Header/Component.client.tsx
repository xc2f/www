'use client'
import type { Header } from '@/payload-types'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { Link, usePathname } from '@/i18n/navigation'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

export function HeaderClient({ navItems }: Pick<Header, 'navItems'>) {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header data-site-header className="relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="container flex flex-wrap items-center justify-between gap-x-6 gap-y-0.5 py-3 sm:py-4">
        <Link
          className="site-header-home flex min-h-11 shrink-0 items-center"
          href="/"
          aria-label="XC2F"
        >
          <Logo className="site-header-logo" variant="signal" />
        </Link>
        <HeaderNav navItems={navItems} />
      </div>
    </header>
  )
}
