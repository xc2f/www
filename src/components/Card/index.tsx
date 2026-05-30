'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import React from 'react'

import type { Post } from '@/payload-types'
import type { Locale } from '@/i18n/types'

import { Media } from '@/components/Media'
import { formatTime } from '@/utilities/formatTime'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'publishedAt'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const locale = useLocale() as Locale
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { categories, meta, publishedAt, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${doc?.slug}`
  const publishedLabel = publishedAt ? formatTime(publishedAt, locale) : null
  const categoryTitles =
    categories?.flatMap((category) => {
      if (typeof category !== 'object') return []

      const categoryTitle = category.title || (locale === 'zh' ? '未命名分类' : 'Untitled category')

      return [categoryTitle]
    }) || []
  const categorySummary = categoryTitles.join(' / ')

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-transparent bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.94))] text-card-foreground shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-300 ease-out hover:cursor-pointer dark:bg-[linear-gradient(180deg,rgba(8,13,18,0.94),rgba(5,9,14,0.985))] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)]',
        className,
      )}
      ref={card.ref}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_18%,rgba(255,255,255,0)_82%,rgba(15,23,42,0.03))] opacity-80 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0)_20%,rgba(255,255,255,0)_72%,rgba(125,215,255,0.03))]" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.02]" />
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5 dark:bg-[#05080d]">
        {metaImage && typeof metaImage !== 'string' && (
          <>
            <Media
              fill
              imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              pictureClassName="absolute inset-0"
              resource={metaImage}
              resourceSize="medium"
              size="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,23,42,0.02)_24%,rgba(15,23,42,0.22)_72%,rgba(15,23,42,0.46)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,5,9,0.03),rgba(2,5,9,0.1)_22%,rgba(2,5,9,0.36)_72%,rgba(2,5,9,0.72)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.06))] dark:bg-[linear-gradient(180deg,transparent,rgba(125,215,255,0.06))]" />
          </>
        )}
        {(!metaImage || typeof metaImage === 'string') && (
          <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,rgba(7,10,16,0.96),rgba(10,14,22,0.88)_54%,rgba(14,18,24,0.74)_100%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(255,255,255,0.1),transparent_16%),radial-gradient(circle_at_68%_34%,rgba(125,215,255,0.12),transparent_22%),radial-gradient(circle_at_52%_76%,rgba(255,143,114,0.09),transparent_20%),radial-gradient(circle_at_46%_46%,rgba(255,255,255,0.035),transparent_32%)]" />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(180deg,transparent,transparent_15px,rgba(255,255,255,0.025)_16px)] [background-size:100%_16px]" />
            <div className="absolute left-[18%] top-[18%] h-28 w-28 rounded-full bg-[#ff8f72]/8 blur-3xl" />
            <div className="absolute right-[16%] top-[26%] h-36 w-36 rounded-full bg-[#7dd7ff]/10 blur-[72px]" />
            <div className="absolute inset-x-[20%] top-[22%] h-24 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_72%)] blur-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(4,6,10,0.18)_72%,rgba(2,4,8,0.4)_100%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.42em] text-white/44">
                <span className="absolute left-[-1.1rem] top-1/2 h-px w-5 -translate-y-1/2 bg-gradient-to-r from-transparent to-cyan-100/35" />
                <span className="absolute right-[-1.1rem] top-1/2 h-px w-5 -translate-y-1/2 bg-gradient-to-l from-transparent to-white/20" />
                <span className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_72%)] blur-xl" />
                <span className="relative translate-y-[0.02em] text-white/55">X</span>
                <span className="relative text-[#ff8f72]/70">C</span>
                <span className="relative text-white/42">2</span>
                <span className="relative text-[#7dd7ff]/70">F</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.04)_72%,rgba(255,255,255,0.08))]" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-[linear-gradient(90deg,rgba(15,23,42,0),rgba(15,23,42,0.08)_12%,rgba(15,23,42,0.12)_50%,rgba(15,23,42,0.08)_88%,rgba(15,23,42,0))] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.05)_12%,rgba(125,215,255,0.1)_50%,rgba(255,255,255,0.05)_88%,rgba(255,255,255,0))]" />
      </div>
      <div className="relative flex flex-1 flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,rgba(15,23,42,0),rgba(15,23,42,0.05)_14%,rgba(15,23,42,0.08)_50%,rgba(15,23,42,0.05)_86%,rgba(15,23,42,0))] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.03)_14%,rgba(125,215,255,0.08)_50%,rgba(255,255,255,0.03)_86%,rgba(255,255,255,0))]" />
        <div className="flex flex-1 flex-col">
          {titleToUse && (
            <div>
              <h3 className="text-[1.18rem] font-medium leading-[1.35] text-card-foreground transition-colors duration-300 dark:text-white/88">
                <Link
                  className="text-card-foreground transition-colors duration-300 hover:text-foreground dark:text-white/88 dark:hover:text-white"
                  href={href}
                  ref={link.ref}
                >
                  {titleToUse}
                </Link>
              </h3>
            </div>
          )}
          {description && (
            <div className="mt-3 text-sm leading-6 text-muted-foreground dark:text-white/48">
              <p className="line-clamp-3">{sanitizedDescription}</p>
            </div>
          )}
        </div>
        <div className="relative flex min-h-[1.25rem] items-center justify-between gap-4 pt-4 text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground dark:text-white/38">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(15,23,42,0),rgba(15,23,42,0.07)_10%,rgba(15,23,42,0.1)_50%,rgba(15,23,42,0.07)_90%,rgba(15,23,42,0))] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.035)_10%,rgba(125,215,255,0.09)_50%,rgba(255,255,255,0.035)_90%,rgba(255,255,255,0))]" />
          {publishedLabel && (
            <time
              className="shrink-0 font-mono text-card-foreground/72 dark:text-white/52"
              dateTime={publishedAt ?? undefined}
            >
              {publishedLabel}
            </time>
          )}
          <span className="min-w-0 truncate font-mono text-card-foreground/72 dark:text-white/52">
            {showCategories && hasCategories ? categorySummary : ''}
          </span>
        </div>
      </div>
    </article>
  )
}
