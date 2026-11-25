import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { getPayload, type Where } from 'payload'

import { routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/types'
import type { Media, Moment } from '@/payload-types'
import type { MomentFeedItem } from './MomentsFeed'

export const MOMENTS_PAGE_SIZE = 12

type MomentQueryDoc = Pick<
  Moment,
  'id' | 'title' | 'content' | 'mood' | 'publishedAt' | 'aiTranslated'
> & {
  images?: {
    id?: string | null
    image?: number | Media | null
  }[] | null
}

type OriginalMoment = {
  title?: string | null
  content?: Moment['content']
}

const getSourceLocale = (locale: Locale): Locale | undefined =>
  routing.locales.find((code) => code !== locale) as Locale | undefined

const formatMomentFeedItem = (
  moment: MomentQueryDoc,
  original?: OriginalMoment,
): MomentFeedItem => ({
  id: moment.id,
  title: moment.title,
  content: moment.content,
  mood: moment.mood,
  publishedAt: moment.publishedAt,
  aiTranslated: Boolean(moment.aiTranslated),
  original: original ?? null,
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
    const where: Where | undefined = draft
      ? undefined
      : {
          _status: { equals: 'published' },
        }

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
        aiTranslated: true,
      },
      ...(where ? { where } : {}),
    })

    const docs = moments.docs || []
    const sourceLocale = getSourceLocale(locale)
    const translatedIds = docs.filter((doc) => doc.aiTranslated).map((doc) => doc.id)

    const originals = new Map<number, OriginalMoment>()
    if (sourceLocale && translatedIds.length > 0) {
      const { docs: sourceDocs } = await payload.find({
        collection: 'moments',
        depth: 0,
        draft,
        locale: sourceLocale,
        overrideAccess: draft,
        pagination: false,
        where: { id: { in: translatedIds } },
        select: { title: true, content: true },
      })

      for (const sourceDoc of sourceDocs) {
        originals.set(sourceDoc.id, { title: sourceDoc.title, content: sourceDoc.content })
      }
    }

    return {
      ...moments,
      docs: docs.map((doc) => formatMomentFeedItem(doc, originals.get(doc.id))),
    }
  },
)
