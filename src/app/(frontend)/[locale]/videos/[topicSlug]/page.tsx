import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import type { Locale } from '@/i18n/types'

import { routing } from '@/i18n/routing'
import PageClient from '../page.client'
import { queryPublishedVideos, queryVideoTopicBySlug } from '../queries'
import { createVideosMetadata } from '../videoMeta'
import { VideoArchiveIntro } from '../VideoArchiveIntro'
import { VideoGrid } from '../VideoGrid'

export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const topics = await payload.find({
    collection: 'video-topics',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return routing.locales.flatMap((locale) =>
    topics.docs.map((topic) => ({
      locale,
      topicSlug: topic.slug,
    })),
  )
}

type Args = {
  params: Promise<{
    locale: Locale
    topicSlug: string
  }>
}

export default async function Page({ params }: Args) {
  const { locale, topicSlug } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Videos')
  const decodedTopicSlug = decodeURIComponent(topicSlug)
  const topic = await queryVideoTopicBySlug({ locale, slug: decodedTopicSlug })

  if (!topic) notFound()

  const videos = await queryPublishedVideos({ limit: 100, locale, topicID: topic.id })

  return (
    <div className="pb-24">
      <PageClient />
      <VideoArchiveIntro
        description={topic.description || t('topic_intro_description')}
        descriptionSecondLine={t('topic_intro_description_second_line')}
        eyebrow={t('topic_eyebrow')}
        title={topic.title}
      />

      <div className="container mt-6 sm:mt-7">
        <div className="grid grid-cols-4 gap-x-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-6 xl:gap-x-7">
          <div className="col-span-4 md:col-span-4 lg:col-span-6 xl:col-span-4">
            <p className="max-w-full py-2 text-[0.95rem] leading-6 tracking-[0.01em] text-[#284855] dark:text-[#b9ecff]/78">
              {t('count', { count: videos.totalDocs })}
            </p>
          </div>
        </div>
      </div>

      <VideoGrid className="mt-6 sm:mt-7" videos={videos.docs} />
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale, topicSlug } = await params
  setRequestLocale(locale)

  const decodedTopicSlug = decodeURIComponent(topicSlug)
  const topic = await queryVideoTopicBySlug({ locale, slug: decodedTopicSlug })

  if (!topic) return {}

  return createVideosMetadata({
    description: topic.description,
    title: topic.title,
    url: `/${locale}/videos/${topic.slug}`,
  })
}
