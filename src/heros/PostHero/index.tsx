import React from 'react'

import type { Post } from '@/payload-types'

import { LocalTime } from '@/components/LocalTime'
import { Media } from '@/components/Media'

import { useTranslations } from 'next-intl'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const t = useTranslations('Posts')

  const { categories, heroImage, meta, publishedAt, title } = post
  const summary = meta?.description?.trim()
  const categoryTitles =
    categories?.flatMap((category) => {
      if (typeof category !== 'object' || category === null) return []

      return [category.title || t('untitled_category')]
    }) ?? []
  const categorySummary = categoryTitles.join(' / ')

  return (
    <div className="relative -mt-[10.4rem] overflow-hidden bg-[#06080A] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,143,114,0.12),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(125,215,255,0.1),transparent_36%),linear-gradient(180deg,rgba(4,7,11,0.05),rgba(4,7,11,0.24)_54%,rgba(4,7,11,0.56)_100%)]" />
      <div className="mux-grid pointer-events-none absolute inset-0 opacity-[0.18]" />
      <div className="home-noise pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="home-vignette pointer-events-none absolute inset-0 opacity-[0.96]" />

      <div className="container relative z-10 grid min-h-[84vh] items-end pb-12 pt-40 sm:pb-14 sm:pt-44 lg:grid-cols-[minmax(0,72rem)_minmax(0,1fr)] lg:pb-16 lg:pt-48">
        <div className="max-w-[72rem]">
          <h1 className="max-w-none text-[2.8rem] font-medium leading-[1.05] tracking-[-0.05em] text-white sm:text-[4.25rem] lg:text-[5.4rem]">
            {title}
          </h1>

          {summary && (
            <p className="mt-6 max-w-2xl text-[1rem] leading-7 text-white/64 sm:text-[1.12rem] sm:leading-8">
              {summary}
            </p>
          )}

          {publishedAt && (
            <div className="mt-10 flex text-white/72">
              <div className="flex items-baseline gap-3 sm:gap-4">
                {categorySummary ? (
                  <p className="min-w-0 truncate font-mono text-sm uppercase tracking-[0.22em] text-white/48">
                    {categorySummary}
                  </p>
                ) : null}
                <time className="text-sm text-white/78 sm:text-[0.95rem]" dateTime={publishedAt}>
                  <LocalTime time={publishedAt} />
                </time>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 min-h-[84vh] select-none">
        {heroImage && typeof heroImage !== 'string' && (
          <Media
            fill
            priority
            imgClassName="object-cover object-center opacity-[0.82]"
            resource={heroImage}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,9,0.06),rgba(3,6,10,0.14)_26%,rgba(3,6,10,0.22)_66%,rgba(4,7,11,0.32)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,transparent_26%,rgba(3,6,10,0.04)_46%,rgba(3,6,10,0.12)_78%,rgba(3,6,10,0.22)_100%)]" />
      </div>
    </div>
  )
}
