'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType; isHomePage?: boolean }> = ({
  data,
  isHomePage = false,
}) => {
  const navItems = data?.navItems || []

  return (
    <nav
      className={`flex items-center ${
        isHomePage ? 'home-header-nav gap-5 sm:gap-6' : 'gap-3'
      }`}
    >
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance={isHomePage ? 'inline' : 'link'}
            className={isHomePage ? 'home-header-link' : undefined}
          />
        )
      })}
      <Link className={isHomePage ? 'home-header-search' : undefined} href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className={isHomePage ? 'h-5 w-5' : 'w-5 text-primary'} />
      </Link>
    </nav>
  )
}
