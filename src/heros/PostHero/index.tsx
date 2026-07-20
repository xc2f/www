import React from 'react'

import type { Post } from '@/payload-types'

import { DetailHero } from '@/components/DetailPage/DetailHero'
import { LocalTime } from '@/components/LocalTime'

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

  const metaNode = publishedAt ? (
    <div className="flex text-white/72">
      <div className="flex items-baseline gap-3 sm:gap-4">
        <time className="text-sm text-white/78 sm:text-[0.95rem]" dateTime={publishedAt}>
          <LocalTime time={publishedAt} />
        </time>
        {categorySummary ? (
          <p className="min-w-0 truncate font-mono text-sm uppercase tracking-[0.22em] text-white/48">
            {categorySummary}
          </p>
        ) : null}
      </div>
    </div>
  ) : null

  return <DetailHero image={heroImage} meta={metaNode} summary={summary} title={title} />
}
