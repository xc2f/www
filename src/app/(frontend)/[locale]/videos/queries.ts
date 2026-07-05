import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/types'

export const queryPublishedVideos = cache(
  async ({
    limit = 12,
    locale,
    page = 1,
    topicID,
  }: {
    limit?: number
    locale: Locale
    page?: number
    topicID?: number
  }) => {
    const payload = await getPayload({ config: configPromise })

    const videos = await payload.find({
      collection: 'videos',
      depth: 2,
      draft: false,
      limit,
      overrideAccess: false,
      page,
      locale,
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          ...(topicID
            ? [
                {
                  topic: {
                    equals: topicID,
                  },
                },
              ]
            : []),
        ],
      },
    })

    return videos
  },
)

export const queryVideoTopicBySlug = cache(
  async ({ locale, slug }: { locale: Locale; slug: string }) => {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'video-topics',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      locale,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return result.docs?.[0] || null
  },
)

export const queryVideoBySlugAndTopic = cache(
  async ({ locale, slug, topicID }: { locale: Locale; slug: string; topicID: number }) => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'videos',
      depth: 2,
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      locale,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            topic: {
              equals: topicID,
            },
          },
        ],
      },
    })

    return result.docs?.[0] || null
  },
)
