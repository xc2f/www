import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'

import type { Locale } from '@/i18n/types'

import { DetailHero } from '@/components/DetailPage/DetailHero'
import { DetailRichText } from '@/components/DetailPage/DetailRichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { formatTime } from '@/utilities/formatTime'
import PageClient from './page.client'
import { queryVideoBySlugAndTopic, queryVideoTopicBySlug } from '../../queries'
import { createVideosMetadata } from '../../videoMeta'
import { getVideoCover, getVideoTags, getVideoTopic } from '../../videoUtils'

type Args = {
  params: Promise<{
    locale: Locale
    topicSlug: string
    videoSlug: string
  }>
}

export default async function Page({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, topicSlug, videoSlug } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Videos')
  const decodedTopicSlug = decodeURIComponent(topicSlug)
  const decodedVideoSlug = decodeURIComponent(videoSlug)
  const topic = await queryVideoTopicBySlug({ locale, slug: decodedTopicSlug })

  if (!topic) notFound()

  const video = await queryVideoBySlugAndTopic({
    locale,
    slug: decodedVideoSlug,
    topicId: topic.id,
  })

  if (!video) notFound()

  const cover = getVideoCover(video)
  const tags = getVideoTags(video)
  const populatedTopic = getVideoTopic(video)
  const topicTitle = populatedTopic?.title || topic.title
  const publishedLabel = video.publishedAt ? formatTime(video.publishedAt, locale) : null
  const originalPublishedLabel = video.originalPublishedAt
    ? formatTime(video.originalPublishedAt, locale)
    : null

  return (
    <article className="relative overflow-hidden bg-background pb-20">
      <PageClient />
      {draft && <LivePreviewListener />}

      <DetailHero
        eyebrow={`${t('detail_eyebrow')} / ${topicTitle}`}
        image={cover}
        meta={
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-white/72">
            {publishedLabel ? (
              <time
                className="text-sm text-white/78 sm:text-[0.95rem]"
                dateTime={video.publishedAt ?? undefined}
              >
                {publishedLabel}
              </time>
            ) : null}
            {tags.length > 0 ? (
              <p className="min-w-0 font-mono text-sm uppercase tracking-[0.22em] text-white/48">
                {tags.map((tag) => tag.title).join(' / ')}
              </p>
            ) : null}
          </div>
        }
        summary={video.summary}
        title={video.title}
      />

      <div className="pointer-events-none absolute left-[-14rem] top-[36rem] h-[28rem] w-[28rem] rounded-full bg-[#ff8f72]/[0.03] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-12rem] top-[48rem] h-[30rem] w-[30rem] rounded-full bg-[#7dd7ff]/[0.028] blur-[140px]" />

      <div className="relative z-20 -mt-4 pt-0 sm:-mt-8">
        <div className="container">
          <div className="relative mx-auto max-w-[58rem] space-y-8">
            {video.embedUrl ? (
              <div className="relative overflow-hidden rounded-[1.35rem] border border-black/[0.045] bg-black shadow-[0_18px_52px_rgba(15,23,42,0.16)] dark:border-white/[0.055] dark:shadow-[0_22px_64px_rgba(0,0,0,0.34)]">
                <div className="aspect-video">
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    src={video.embedUrl}
                    title={video.title}
                  />
                </div>
              </div>
            ) : null}

            {video.content ? (
              <DetailRichText data={video.content} />
            ) : null}

            <section className="relative overflow-hidden rounded-[1.2rem] border border-black/[0.045] bg-white/54 px-5 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.035)] backdrop-blur-[6px] sm:px-7 dark:border-white/[0.05] dark:bg-[linear-gradient(180deg,rgba(8,13,18,0.58),rgba(6,10,15,0.72))] dark:shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/[0.08]" />
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <VideoMetaRow label={t('topic')} value={topicTitle} />
                <VideoMetaRow label={t('original_title')} value={video.originalTitle} />
                <VideoMetaRow label={t('source')} value={video.originalAuthor} />
                <VideoMetaRow label={t('original_published_at')} value={originalPublishedLabel} />
                <VideoMetaRow label={t('published_at')} value={publishedLabel} />
                <VideoMetaRow label={t('tags')} value={tags.map((tag) => tag.title).join(' / ')} />
                <VideoMetaLink label={t('original_url')} value={video.originalUrl} />
                <VideoMetaLink label={t('watch_url')} value={video.videoUrl} />
              </dl>
            </section>
          </div>
        </div>
      </div>
    </article>
  )
}

function VideoMetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div>
      <dt className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-muted-foreground dark:text-white/36">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-foreground/78 dark:text-white/68">{value}</dd>
    </div>
  )
}

function VideoMetaLink({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div>
      <dt className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-muted-foreground dark:text-white/36">
        {label}
      </dt>
      <dd className="mt-1 min-w-0 text-sm leading-6">
        <a
          className="break-words text-foreground/78 underline decoration-black/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-black/45 dark:text-white/68 dark:decoration-white/20 dark:hover:text-white dark:hover:decoration-white/45"
          href={value}
          rel="noopener noreferrer"
          target="_blank"
        >
          {value}
        </a>
      </dd>
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale, topicSlug, videoSlug } = await params
  setRequestLocale(locale)

  const decodedTopicSlug = decodeURIComponent(topicSlug)
  const decodedVideoSlug = decodeURIComponent(videoSlug)
  const topic = await queryVideoTopicBySlug({ locale, slug: decodedTopicSlug })

  if (!topic) return {}

  const video = await queryVideoBySlugAndTopic({
    locale,
    slug: decodedVideoSlug,
    topicId: topic.id,
  })

  if (!video) return {}

  return createVideosMetadata({
    description: video.summary,
    image: getVideoCover(video),
    title: video.title,
    url: `/${locale}/videos/${topic.slug}/${video.slug}`,
  })
}
