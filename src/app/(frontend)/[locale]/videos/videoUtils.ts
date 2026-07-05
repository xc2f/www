import type { Media, Tag, Video, VideoTopic } from '@/payload-types'

export function getVideoTopic(video: Pick<Video, 'topic'>): VideoTopic | null {
  return typeof video.topic === 'object' && video.topic !== null ? video.topic : null
}

export function getVideoTags(video: Pick<Video, 'tags'>): Tag[] {
  return (
    video.tags?.flatMap((tag) => {
      if (typeof tag !== 'object' || tag === null) return []

      return [tag]
    }) ?? []
  )
}

export function getVideoCover(video: Pick<Video, 'cover'>): Media | null {
  return typeof video.cover === 'object' && video.cover !== null ? video.cover : null
}

export function getVideoPath(video: Pick<Video, 'slug' | 'topic'>): string | null {
  const topic = getVideoTopic(video)

  if (!topic?.slug || !video.slug) return null

  return `/videos/${topic.slug}/${video.slug}`
}
