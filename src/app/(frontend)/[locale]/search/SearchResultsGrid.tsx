import React from 'react'

import type { Media } from '@/payload-types'

import { ArchiveCard } from '@/components/ArchiveCard'
import { Card, type CardPostData } from '@/components/Card'
import { cn } from '@/utilities/ui'

export type SearchVideoData = {
  cover?: Media | null
  href?: string | null
  originalAuthor?: string | null
  publishedAt?: string | null
  summary?: string | null
  tags?: { title?: string | null }[] | null
  title?: string | null
  topic?: {
    title?: string | null
  } | null
}

export type SearchResult =
  | {
      id: string
      post: CardPostData
      type: 'post'
    }
  | {
      id: string
      type: 'video'
      video: SearchVideoData
    }

type SearchResultsGridProps = {
  className?: string
  results: SearchResult[]
}

export function SearchResultsGrid({ className, results }: SearchResultsGridProps) {
  return (
    <div className={cn('container', className)}>
      <div className="grid grid-cols-4 gap-x-4 gap-y-5 sm:grid-cols-8 sm:gap-y-6 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-8 xl:gap-x-7 xl:gap-y-10">
        {results.map((result) => (
          <div className="col-span-4 md:col-span-4 lg:col-span-6 xl:col-span-4" key={result.id}>
            {result.type === 'post' ? (
              <Card className="h-full" doc={result.post} relationTo="posts" showCategories />
            ) : (
              <ArchiveCard
                className="h-full"
                description={result.video.summary}
                href={result.video.href}
                image={result.video.cover}
                placeholderLabel="XC2F / VIDEO"
                publishedAt={result.video.publishedAt}
                tags={
                  result.video.tags
                    ?.map((tag) => tag.title)
                    .filter((tag): tag is string => Boolean(tag)) ?? []
                }
                title={result.video.title}
                topLabel={result.video.topic?.title}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
