import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

import { Locale } from '@/i18n/types'
import { routing } from '@/i18n/routing'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { PostsArchiveIntro } from './PostsArchiveIntro'

export const revalidate = 600

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  // Enable static rendering
  setRequestLocale(locale)
  const t = await getTranslations('Posts')

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    locale,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
  })

  return (
    <div className="pb-24">
      <PageClient />
      <PostsArchiveIntro title={t('posts')} />

      <div className="container mt-6 sm:mt-7">
        <div className="grid grid-cols-4 gap-x-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-6 xl:gap-x-7">
          <div className="col-span-4 md:col-span-4 lg:col-span-6 xl:col-span-4">
            <PageRange
              collection="posts"
              currentPage={posts.page}
              limit={12}
              totalDocs={posts.totalDocs}
            />
          </div>
        </div>
      </div>

      <CollectionArchive className="mt-6 sm:mt-7" posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination className="mt-14" page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Posts')
  return {
    title: t('posts'),
  }
}
