'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import type { Media, Moment } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import MomentsFeed, { type MomentFeedItem } from './MomentsFeed'

type LiveMomentData = {
  id: number
  title?: string | null
  content?: Moment['content']
  mood?: Moment['mood']
  publishedAt?: string | null
  aiTranslated?: boolean | null
  images?: {
    id?: string | null
    image?: number | Media | null
  }[] | null
}

type LiveMomentsFeedProps = {
  initialMoments: MomentFeedItem[]
  initialHasNextPage?: boolean | null
  initialNextPage?: number | null
}

export default function LiveMomentsFeed(props: LiveMomentsFeedProps) {
  const initialMoment = props.initialMoments[0]

  if (!initialMoment) {
    return <MomentsFeed {...props} />
  }

  return <LiveMomentsFeedWithData {...props} initialData={initialMoment} />
}

function LiveMomentsFeedWithData(
  props: LiveMomentsFeedProps & { initialData: MomentFeedItem },
) {
  const { data } = useLivePreview<LiveMomentData>({
    initialData: props.initialData,
    serverURL: getClientSideURL(),
  })
  const savedMoment = props.initialMoments.find((moment) => moment.id === data.id)
  const previewMoment: MomentFeedItem = {
    id: data.id,
    title: data.title,
    content: data.content,
    mood: data.mood,
    publishedAt: data.publishedAt,
    aiTranslated: data.aiTranslated,
    original: savedMoment?.original,
    images: (data.images ?? []).flatMap((item) => {
      const image = item.image
      if (!image || typeof image !== 'object') return []

      return [{ id: item.id ?? String(image.id), image }]
    }),
  }

  return <MomentsFeed {...props} previewMoment={previewMoment} />
}
