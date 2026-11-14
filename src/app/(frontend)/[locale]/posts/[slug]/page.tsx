import type { Metadata } from 'next'

import { ArrowUpRight } from 'lucide-react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Post } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { ArchiveEntry, ContentArchive } from '../../ContentArchive'
import './post-detail.css'

type Args = {
  params: Promise<{
    slug?: string
    locale: Locale
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '', locale } = await paramsPromise

  // Enable static rendering
  setRequestLocale(locale)
  const t = await getTranslations('Posts')

  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  if (!post) return <PayloadRedirects url={url} />

  const relatedPosts = post.relatedPosts?.filter((post) => typeof post === 'object') ?? []

  const summary = post.meta?.description?.trim()
  const cover = typeof post.heroImage === 'object' ? post.heroImage : null
  const date = post.publishedAt ? new Date(post.publishedAt) : null
  const categories =
    post.categories?.flatMap((category) =>
      typeof category === 'object' && category?.title ? [category.title] : [],
    ) ?? []

  return (
    <ContentArchive
      title={post.title}
      className="post-detail"
      intro={
        <>
          {summary && <p className="post-summary">{summary}</p>}
          <div className="archive-entry-meta post-meta">
            {date && Number.isFinite(date.getTime()) && (
              <time dateTime={post.publishedAt ?? undefined}>
                {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
                  date,
                )}
              </time>
            )}
            {categories.map((category, index) => (
              <span key={index}>{category}</span>
            ))}
          </div>
        </>
      }
    >
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      {cover?.url && (
        <Media
          resource={cover}
          className="post-cover"
          imgClassName="w-full object-cover"
          size="(max-width: 832px) 100vw, 784px"
          priority
        />
      )}
      <RichText data={post.content} enableGutter={false} className="post-prose max-w-none" />

      {relatedPosts.length > 0 && (
        <section className="post-followup" aria-labelledby="post-related">
          <h2 id="post-related">{t('related_posts')}</h2>
          <ul className="archive-list">
            {relatedPosts.map((item) => (
              <ArchiveEntry
                key={item.id}
                href={item.slug ? `/posts/${item.slug}` : undefined}
                title={item.title}
                description={item.meta?.description}
                date={item.publishedAt}
                locale={locale}
                headingLevel={3}
              />
            ))}
          </ul>
        </section>
      )}

      {post.githubDiscussionUrl && (
        <section className="post-followup" aria-labelledby="post-discussion">
          <h2 id="post-discussion">{t('discussion')}</h2>
          <a
            className="post-discussion-link"
            href={post.githubDiscussionUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('join_the_discussion_on_github')}
            <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </section>
      )}
    </ContentArchive>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '', locale } = await paramsPromise
  setRequestLocale(locale)
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
