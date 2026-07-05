import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/types'
import type { Media, Moment } from '@/payload-types'
import type { MomentFeedItem } from './MomentsFeed'

export const MOMENTS_PAGE_SIZE = 12

type MomentQueryDoc = Pick<Moment, 'id' | 'title' | 'content' | 'mood' | 'publishedAt'> & {
  images?: {
    id?: string | null
    image?: number | Media | null
  }[] | null
}

const formatMomentFeedItem = (moment: MomentQueryDoc): MomentFeedItem => ({
  id: moment.id,
  title: moment.title,
  content: moment.content,
  mood: moment.mood,
  publishedAt: moment.publishedAt,
  images: (moment.images ?? []).flatMap((item) => {
    if (!item?.image || typeof item.image === 'number') {
      return []
    }

    return [
      {
        id: item.id ?? String(item.image.id),
        image: item.image as Media,
      },
    ]
  }),
})

export const queryMomentsPage = cache(
  async ({
    limit = MOMENTS_PAGE_SIZE,
    locale,
    page = 1,
  }: {
    limit?: number
    locale: Locale
    page?: number
  }) => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    const moments = await payload.find({
      collection: 'moments',
      draft,
      depth: 1,
      limit,
      overrideAccess: draft,
      page,
      locale,
      select: {
        title: true,
        mood: true,
        images: true,
        content: true,
        publishedAt: true,
      },
      where: {
        _status: { equals: 'published' },
      },
    })

    return {
      ...moments,
      docs: (moments.docs || []).map(formatMomentFeedItem),
    }
  },
)
