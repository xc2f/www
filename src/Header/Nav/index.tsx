'use client'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import NextLink from 'next/link'

import { Link, usePathname } from '@/i18n/navigation'

import { routing } from '@/i18n/routing'
import type { Header } from '@/payload-types'
import { usePathname as useLocalizedPathname } from 'next/navigation'

const linkClassName = 'inline-flex min-h-11 shrink-0 items-center whitespace-nowrap'

export function HeaderNav({ navItems }: Pick<Header, 'navItems'>) {
  const t = useTranslations('Home.archive')
  const search = useTranslations('Search')
  const pathname = usePathname()
  const localizedPathname = useLocalizedPathname()

  return (
    <nav
      aria-label={t('label')}
      className="site-header-nav flex min-w-0 flex-wrap items-center gap-x-4 gap-y-0.5 text-sm sm:gap-x-6"
    >
      {navItems?.map(({ id, link }, index) => {
        const reference = link.reference?.value
        const href =
          link.type === 'reference'
            ? typeof reference === 'object' && reference?.slug
              ? link.reference?.relationTo === 'posts'
                ? `/posts/${reference.slug}`
                : reference.slug === 'home'
                  ? '/'
                  : `/${reference.slug}`
              : null
            : link.url

        if (!href) return null

        const [path] = href.split(/[?#]/, 1)
        const firstSegment = path.split('/')[1]
        const localize =
          path.startsWith('/') &&
          !path.startsWith('//') &&
          !routing.locales.some((locale) => locale === firstSegment) &&
          firstSegment !== 'admin' &&
          firstSegment !== 'api' &&
          !path.includes('.')
        const NavLink = localize ? Link : NextLink
        const activePath = localize ? pathname : localizedPathname
        const normalizedPath = path.replace(/\/$/, '') || '/'
        const isPosts = /^\/(?:en\/|zh\/)?posts$/.test(normalizedPath)
        const current =
          path && activePath === normalizedPath
            ? 'page'
            : isPosts && activePath.startsWith(`${normalizedPath}/`)
              ? 'location'
              : undefined
        return (
          <NavLink
            key={id ?? index}
            href={href}
            aria-current={current}
            className={linkClassName}
            {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {link.label}
          </NavLink>
        )
      })}
      <Link
        className="site-header-search inline-flex min-h-11 min-w-11 items-center justify-center"
        href="/search"
        aria-current={pathname === '/search' ? 'page' : undefined}
      >
        <span className="sr-only">{search('search')}</span>
        <SearchIcon aria-hidden="true" size={18} strokeWidth={1.5} />
      </Link>
    </nav>
  )
}
