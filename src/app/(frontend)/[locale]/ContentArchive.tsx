import type { ReactNode } from 'react'
import { ArrowUpRight, ChevronRight } from 'lucide-react'

import { Media } from '@/components/Media'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/types'
import type { Media as MediaData } from '@/payload-types'

import './home/home.css'
import './content-archive.css'

export function ContentArchive({
  title,
  intro,
  children,
  className,
}: {
  title: string
  intro?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <main
      className={`home-index content-archive${className ? ` ${className}` : ''}`}
      id="main-content"
    >
      <div className="content-archive-inner">
        <header className="content-archive-heading">
          <h1>{title}</h1>
          {intro}
        </header>
        {children}
      </div>
    </main>
  )
}

export function ArchiveEntry({
  href,
  title,
  description,
  date,
  image,
  kind,
  external = false,
  headingLevel = 2,
  locale,
}: {
  href?: string | null
  title?: string | null
  description?: string | null
  date?: string | null
  image?: number | MediaData | null
  kind?: string
  external?: boolean
  headingLevel?: 2 | 3
  locale: Locale
}) {
  const timestamp = date ? new Date(date) : null
  const Heading = headingLevel === 3 ? 'h3' : 'h2'
  const Arrow = external ? ArrowUpRight : ChevronRight
  const EntryLink = external ? 'a' : Link
  const content = (
    <>
      <div className="archive-entry-copy">
        <div className="archive-entry-meta">
          {kind && <span>{kind}</span>}
          {timestamp && Number.isFinite(timestamp.getTime()) && (
            <time dateTime={date!}>
              {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
                timestamp,
              )}
            </time>
          )}
        </div>
        <Heading className="archive-entry-title">{title || href}</Heading>
        {description && <p>{description}</p>}
      </div>
      {typeof image === 'object' && image?.url && image.mimeType?.startsWith('image/') && (
        <Media
          resource={image}
          className="archive-entry-image"
          imgClassName="h-full w-full object-cover"
          size="112px"
        />
      )}
      {href && (
        <Arrow className="archive-entry-arrow" size={17} strokeWidth={1.4} aria-hidden="true" />
      )}
    </>
  )
  return (
    <li>
      {href ? (
        <EntryLink className="archive-entry" href={href}>
          {content}
        </EntryLink>
      ) : (
        <article className="archive-entry">{content}</article>
      )}
    </li>
  )
}
