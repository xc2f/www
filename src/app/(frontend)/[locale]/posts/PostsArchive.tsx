import { PageRange } from '@/components/PageRange'
import { ArchivePagination } from '../ArchivePagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ArchiveEntry, ContentArchive } from '../ContentArchive'

const pageSize = 12

export async function PostsArchive({ locale, page = 1 }: { locale: Locale; page?: number }) {
  // Enable static rendering
  setRequestLocale(locale)
  const t = await getTranslations('Posts')

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: pageSize,
    page,
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
    <ContentArchive
      className="content-archive-compact"
      title={t('posts')}
      intro={
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={pageSize}
          totalDocs={posts.totalDocs}
        />
      }
    >
      <PageClient />
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
