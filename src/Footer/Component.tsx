import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { LanguageSelector } from './Locale'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

import { getLocale } from 'next-intl/server'
import { Locale } from '@/i18n/types'

export async function Footer() {
  const locale = (await getLocale()) as Locale

  const footerData: Footer = await getCachedGlobal('footer', 1)(locale)
  const navItems = footerData?.navItems || []

  return (
    <footer
      data-site-footer
      className="position z-30 mt-auto border-t border-white/10 bg-[#0a0a0a] text-white"
    >
      <div className="container flex flex-col gap-8 py-8 md:flex-row md:justify-between">
        <Link className="home-footer-brand flex items-center" href="/">
          <Logo className="home-footer-logo text-white" />
        </Link>

        <div className="home-footer-controls flex flex-col-reverse items-start gap-4 md:flex-row md:items-center">
          <nav className="home-footer-nav flex flex-col gap-4 md:flex-row">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="home-footer-link text-white" key={i} {...link} />
            })}
          </nav>
          <LanguageSelector />
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
