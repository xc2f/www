import React from 'react'

import type { Video } from '@/payload-types'

import { ArchiveCard } from '@/components/ArchiveCard'
import { getVideoCover, getVideoPath, getVideoTags, getVideoTopic } from './videoUtils'

type VideoCardProps = {
  className?: string
  video: Video
}

export const VideoCard: React.FC<VideoCardProps> = ({ className, video }) => {
  const cover = getVideoCover(video)
  const href = getVideoPath(video)
  const tags = getVideoTags(video)
  const topic = getVideoTopic(video)

  return (
    <ArchiveCard
      className={className}
      description={video.summary}
      href={href}
      image={cover}
      placeholderLabel="XC2F / VIDEO"
      publishedAt={video.publishedAt}
      tags={tags.map((tag) => tag.title).filter(Boolean)}
      title={video.title}
      topLabel={topic?.title}
    />
  )
}
