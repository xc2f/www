import React from 'react'

import type { Video } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { VideoCard } from './VideoCard'

type VideoGridProps = {
  className?: string
  videos: Video[]
}

export function VideoGrid({ className, videos }: VideoGridProps) {
  return (
    <div className={cn('container', className)}>
      <div className="grid grid-cols-4 gap-x-4 gap-y-5 sm:grid-cols-8 sm:gap-y-6 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-8 xl:gap-x-7 xl:gap-y-10">
        {videos.map((video) => (
          <div className="col-span-4 md:col-span-4 lg:col-span-6 xl:col-span-4" key={video.id}>
            <VideoCard className="h-full" video={video} />
          </div>
        ))}
      </div>
    </div>
  )
}
