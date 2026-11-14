import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { ArchivePagination } from '../../../ArchivePagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ArchiveEntry, ContentArchive } from '../../../ContentArchive'

type Args = {
  params: Promise<{
    pageNumber: string
    locale: Locale
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber, locale } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  // Enable static rendering
  setRequestLocale(locale)
  const t = await getTranslations('Posts')

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
    locale,
    select: {
      title: true,
      slug: true,
      heroImage: true,
      meta: true,
      publishedAt: true,
    },
  })

  return (
    <ContentArchive title={t('posts')}>
      <PageClient />
      <PageRange
        collection="posts"
        currentPage={posts.page}
        limit={12}
        totalDocs={posts.totalDocs}
      />
      {posts.docs.length > 0 && (
        <ul className="archive-list">
          {posts.docs.map((post) => (
            <ArchiveEntry
              key={post.id}
              href={post.slug ? `/posts/${post.slug}` : undefined}
              title={post.title}
              description={post.meta?.description}
              date={post.publishedAt}
              image={post.heroImage}
              locale={locale}
            />
          ))}
        </ul>
      )}
      {posts.totalPages > 1 && posts.page && (
        <ArchivePagination page={posts.page} totalPages={posts.totalPages} />
      )}
    </ContentArchive>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber, locale } = await paramsPromise
  setRequestLocale(locale)
  const t = await getTranslations('Posts')
  return {
    title: t('page', {
      pageNumber,
    }),
  }
}
