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
  const navClassName = isHomePage
    ? 'home-header-nav w-full flex-wrap justify-end gap-3 sm:w-auto sm:flex-nowrap sm:gap-6'
    : 'w-full flex-wrap justify-end gap-2.5 text-[0.72rem] tracking-[0.16em] text-primary sm:w-auto sm:flex-nowrap sm:gap-3 sm:text-sm sm:tracking-normal'
  const linkClassName = isHomePage
    ? 'home-header-link'
    : 'shrink-0 whitespace-nowrap text-inherit'
  const searchClassName = isHomePage
    ? 'home-header-search'
    : 'shrink-0 text-primary/84 transition-colors hover:text-primary'

  return (
    <nav className={`flex min-w-0 shrink items-center ${navClassName}`}>
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance={isHomePage ? 'inline' : 'link'}
            className={linkClassName}
          />
        )
      })}
      <Link className={searchClassName} href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className={isHomePage ? 'h-5 w-5' : 'h-[1.05rem] w-[1.05rem]'} />
      </Link>
    </nav>
  )
}
