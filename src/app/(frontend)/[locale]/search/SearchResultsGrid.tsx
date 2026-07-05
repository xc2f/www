import React from 'react'

import type { Video } from '@/payload-types'

import { Card, type CardPostData } from '@/components/Card'
import { cn } from '@/utilities/ui'
import { VideoCard } from '../videos/VideoCard'

type SearchResult =
  | {
      id: string
      post: CardPostData
      type: 'post'
    }
  | {
      id: string
      type: 'video'
      video: Video
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
              <VideoCard className="h-full" video={result.video} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
