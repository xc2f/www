import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { LanguageSelector } from './Locale'
import { CMSLink } from '@/components/Link'

import { getLocale } from 'next-intl/server'
import { Locale } from '@/i18n/types'

export async function Footer() {
  const locale = (await getLocale()) as Locale

  const footerData: Footer = await getCachedGlobal('footer', 1)(locale)
  const navItems = footerData?.navItems || []

  return (
    <footer
      data-site-footer
      className="relative z-30 mt-auto border-t border-border bg-background text-muted-foreground"
    >
      <div className="container flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3 text-sm">
        {navItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-5">
            {navItems.map(({ link }, i) => (
              <CMSLink
                className="inline-flex min-h-11 items-center hover:underline"
                key={i}
                {...link}
              />
            ))}
          </div>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-x-4">
          <LanguageSelector />
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
