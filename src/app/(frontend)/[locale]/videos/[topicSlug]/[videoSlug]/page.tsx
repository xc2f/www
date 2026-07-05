import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import type { Locale } from '@/i18n/types'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { routing } from '@/i18n/routing'
import { formatTime } from '@/utilities/formatTime'
import PageClient from './page.client'
import { queryVideoBySlugAndTopic, queryVideoTopicBySlug } from '../../queries'
import { createVideosMetadata } from '../../videoMeta'
import { getVideoCover, getVideoTags, getVideoTopic } from '../../videoUtils'

export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const videos = await payload.find({
    collection: 'videos',
    depth: 1,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      topic: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return routing.locales.flatMap((locale) =>
    videos.docs.flatMap((video) => {
      if (typeof video.topic !== 'object' || video.topic === null) return []

      return [
        {
          locale,
          topicSlug: video.topic.slug,
          videoSlug: video.slug,
        },
      ]
    }),
  )
}

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
    topicID: topic.id,
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

      <section className="relative -mt-[10.4rem] overflow-hidden bg-[#06080A] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,143,114,0.12),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(125,215,255,0.1),transparent_36%),linear-gradient(180deg,rgba(4,7,11,0.05),rgba(4,7,11,0.24)_54%,rgba(4,7,11,0.6)_100%)]" />
        <div className="mux-grid pointer-events-none absolute inset-0 opacity-[0.18]" />
        <div className="home-noise pointer-events-none absolute inset-0 opacity-[0.08]" />
        <div className="home-vignette pointer-events-none absolute inset-0 opacity-[0.96]" />

        <div className="container relative z-10 grid min-h-[84vh] items-end pb-12 pt-40 sm:pb-14 sm:pt-44 lg:grid-cols-[minmax(0,72rem)_minmax(0,1fr)] lg:pb-16 lg:pt-48">
          <div className="max-w-[72rem]">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-white/48">
              {t('detail_eyebrow')} / {topicTitle}
            </p>

            <h1 className="mt-5 max-w-none text-[2.8rem] font-medium leading-[1.05] tracking-[-0.05em] text-white sm:text-[4.25rem] lg:text-[5.4rem]">
              {video.title}
            </h1>

            {video.summary ? (
              <p className="mt-6 line-clamp-4 max-w-2xl text-[1rem] leading-7 text-white/64 sm:line-clamp-3 sm:text-[1.12rem] sm:leading-8">
                {video.summary}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-white/72 sm:mt-10">
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
          </div>
        </div>

        <div className="absolute inset-0 min-h-[84vh] select-none">
          {cover ? (
            <Media
              fill
              priority
              imgClassName="object-cover object-center opacity-[0.82]"
              resource={cover}
              resourceSize="large"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,9,0.08),rgba(3,6,10,0.16)_26%,rgba(3,6,10,0.28)_66%,rgba(4,7,11,0.44)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,transparent_26%,rgba(3,6,10,0.05)_46%,rgba(3,6,10,0.14)_78%,rgba(3,6,10,0.24)_100%)]" />
        </div>
      </section>

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
              <div className="relative overflow-hidden rounded-[1.35rem] border border-black/[0.045] bg-white/72 px-6 py-8 shadow-[0_8px_24px_rgba(15,23,42,0.035)] backdrop-blur-[6px] sm:px-10 sm:py-12 lg:px-12 dark:border-white/[0.045] dark:bg-[linear-gradient(180deg,rgba(8,13,18,0.72),rgba(6,10,15,0.84))] dark:shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_16%,rgba(15,23,42,0)_84%,rgba(15,23,42,0.015))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0)_18%,rgba(125,215,255,0.012)_100%)]" />
                <RichText
                  className="relative mx-auto max-w-[50rem] text-[1.02rem] leading-8 text-foreground/88 dark:text-white/82 [&_a]:text-foreground [&_a]:decoration-black/20 [&_a]:underline-offset-4 hover:[&_a]:decoration-black/45 dark:[&_a]:text-white dark:[&_a]:decoration-white/20 dark:hover:[&_a]:decoration-white/45 [&_blockquote]:border-l-[#7dd7ff]/55 [&_blockquote]:bg-[#7dd7ff]/[0.04] [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:italic dark:[&_blockquote]:bg-white/[0.03] [&_h1]:mt-12 [&_h1]:text-[2.2rem] [&_h1]:font-medium [&_h1]:tracking-[-0.04em] [&_h1]:text-foreground dark:[&_h1]:text-white [&_h2]:mt-14 [&_h2]:text-[1.7rem] [&_h2]:font-medium [&_h2]:tracking-[-0.035em] [&_h2]:text-foreground dark:[&_h2]:text-white [&_h3]:mt-10 [&_h3]:text-[1.3rem] [&_h3]:font-medium [&_h3]:tracking-[-0.03em] [&_h3]:text-foreground dark:[&_h3]:text-white [&_hr]:my-10 [&_hr]:border-black/8 dark:[&_hr]:border-white/[0.08] [&_img]:rounded-[1.25rem] [&_img]:shadow-[0_18px_48px_rgba(15,23,42,0.14)] dark:[&_img]:shadow-[0_22px_60px_rgba(0,0,0,0.34)] [&_li]:marker:text-muted-foreground dark:[&_li]:marker:text-white/34 [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:bg-[#071019] [&_pre]:shadow-[0_18px_52px_rgba(0,0,0,0.3)] [&_strong]:font-medium [&_strong]:text-foreground dark:[&_strong]:text-white [&_ul]:space-y-2"
                  data={video.content}
                  enableGutter={false}
                />
              </div>
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
    topicID: topic.id,
  })

  if (!video) return {}

  return createVideosMetadata({
    description: video.summary,
    image: getVideoCover(video),
    title: video.title,
    url: `/${locale}/videos/${topic.slug}/${video.slug}`,
  })
}
