import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { SearchArchiveIntro } from './SearchArchiveIntro'

type Args = {
  searchParams: Promise<{
    q?: string
  }>
  params: Promise<{
    locale: Locale
  }>
}

export default async function Page({
  searchParams: searchParamsPromise,
  params: paramsPromise,
}: Args) {
  const { locale } = await paramsPromise

  // Enable static rendering
  setRequestLocale(locale)
  const t = await getTranslations('Search')

  const { q: rawQuery } = await searchParamsPromise
  const query = rawQuery?.trim() || ''
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    locale,
    select: {
      doc: true,
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
              {
                'categories.title': {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  const postIDs = posts.docs
    .map((doc) => {
      if (typeof doc.doc?.value === 'object') return doc.doc.value.id
      return doc.doc?.value
    })
    .filter((value): value is number => typeof value === 'number')

  const postDataByID = new Map<number, CardPostData>()

  if (postIDs.length > 0) {
    const indexedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: postIDs.length,
      locale,
      overrideAccess: false,
      pagination: false,
      select: {
        categories: true,
        meta: true,
        publishedAt: true,
        slug: true,
        title: true,
      },
      where: {
        id: {
          in: postIDs,
        },
      },
    })

    indexedPosts.docs.forEach((post) => {
      postDataByID.set(post.id, {
        categories: post.categories,
        meta: post.meta,
        publishedAt: post.publishedAt,
        slug: post.slug,
        title: post.title,
      })
    })
  }

  const archivePosts = posts.docs.map((doc) => {
    const relationDoc = typeof doc.doc?.value === 'object' ? doc.doc.value : null
    const relationID = relationDoc?.id || (typeof doc.doc?.value === 'number' ? doc.doc.value : null)
    const localizedPost = relationID ? postDataByID.get(relationID) : undefined

    return {
      categories:
        localizedPost?.categories ||
        doc.categories?.map((category) => ({
          title: category?.title || undefined,
        })),
      meta: localizedPost?.meta || doc.meta,
      publishedAt:
        localizedPost?.publishedAt || doc.publishedAt || relationDoc?.publishedAt,
      slug: localizedPost?.slug || doc.slug || relationDoc?.slug || '',
      title: localizedPost?.title || doc.title || relationDoc?.title || undefined,
    }
  })

  const resultCount = archivePosts.length

  return (
    <div className="pb-24">
      <PageClient />
      <SearchArchiveIntro
        description={t('intro_description')}
        descriptionSecondLine={t('intro_description_second_line')}
        eyebrow={t('eyebrow')}
        title={t('search')}
      >
        <div className="max-w-4xl">
          <Search defaultValue={query} />
        </div>
      </SearchArchiveIntro>

      <div className="container mt-6 sm:mt-7">
        <div className="grid grid-cols-4 gap-x-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-6 xl:gap-x-7">
          <div className="col-span-4 md:col-span-5 lg:col-span-7 xl:col-span-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 py-2">
              <PageRange
                collection="posts"
                currentPage={posts.page}
                limit={posts.limit}
                totalDocs={posts.totalDocs}
              />
            </div>
          </div>
        </div>
      </div>

      {resultCount > 0 && (
        <CollectionArchive className="mt-6 sm:mt-7" posts={archivePosts as CardPostData[]} />
      )}
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Search')
  return {
    title: t('search'),
  }
}
