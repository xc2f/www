import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { SearchArchiveIntro } from './SearchArchiveIntro'
import { SearchResultsGrid } from './SearchResultsGrid'

type Args = {
  searchParams: Promise<{
    page?: string
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

  const { page: rawPage, q: rawQuery } = await searchParamsPromise
  const query = rawQuery?.trim() || ''
  const parsedPage = Number(rawPage)
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const pageSize = 12
  const searchPoolLimit = 100
  const payload = await getPayload({ config: configPromise })

  const postsWhere: Where | undefined = query
    ? {
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
      }
    : undefined

  const videosWhere: Where = {
    and: [
      {
        _status: {
          equals: 'published',
        },
      },
    ],
  }

  if (query) {
    videosWhere.and?.push({
      or: [
        {
          title: {
            like: query,
          },
        },
        {
          summary: {
            like: query,
          },
        },
        {
          slug: {
            like: query,
          },
        },
        {
          originalTitle: {
            like: query,
          },
        },
        {
          originalAuthor: {
            like: query,
          },
        },
        {
          'topic.title': {
            like: query,
          },
        },
        {
          'tags.title': {
            like: query,
          },
        },
      ],
    })
  }

  const [posts, videos] = await Promise.all([
    payload.find({
      collection: 'search',
      depth: 1,
      limit: searchPoolLimit,
      locale,
      pagination: false,
      select: {
        doc: true,
        title: true,
        slug: true,
        categories: true,
        meta: true,
        publishedAt: true,
        tags: true,
      },
      ...(postsWhere ? { where: postsWhere } : {}),
    }),
    payload.find({
      collection: 'videos',
      depth: 2,
      draft: false,
      limit: searchPoolLimit,
      locale,
      overrideAccess: false,
      pagination: false,
      where: videosWhere,
    }),
  ])

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
        heroImage: true,
        meta: true,
        publishedAt: true,
        slug: true,
        tags: true,
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
        heroImage: post.heroImage,
        meta: post.meta,
        publishedAt: post.publishedAt,
        slug: post.slug,
        tags: post.tags,
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
      heroImage: localizedPost?.heroImage,
      meta: localizedPost?.meta || doc.meta,
      publishedAt:
        localizedPost?.publishedAt || doc.publishedAt || relationDoc?.publishedAt,
      slug: localizedPost?.slug || doc.slug || relationDoc?.slug || '',
      tags: localizedPost?.tags,
      title: localizedPost?.title || doc.title || relationDoc?.title || undefined,
    }
  })

  const sortedSearchResults = [
    ...archivePosts.map((post, index) => ({
      id: `post-${post.slug || index}`,
      post: post as CardPostData,
      rank: getPostSearchRank(post, query),
      sortDate: post.publishedAt,
      type: 'post' as const,
    })),
    ...videos.docs.map((video) => ({
      id: `video-${video.id}`,
      rank: getVideoSearchRank(video, query),
      sortDate: video.publishedAt,
      type: 'video' as const,
      video,
    })),
  ].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank

    return getTimeValue(b.sortDate) - getTimeValue(a.sortDate)
  })
  const totalResults = sortedSearchResults.length
  const totalPages = Math.ceil(totalResults / pageSize)
  const safePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1
  const searchResults = sortedSearchResults.slice((safePage - 1) * pageSize, safePage * pageSize)
  const resultCount = searchResults.length

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
                currentPage={safePage}
                limit={pageSize}
                namespace="Search"
                totalDocs={totalResults}
              />
            </div>
          </div>
        </div>
      </div>

      {resultCount > 0 ? (
        <>
          <SearchResultsGrid className="mt-6 sm:mt-7" results={searchResults} />
          <div className="container">
            {totalPages > 1 ? (
              <Pagination
                basePath="/search"
                className="mt-14"
                page={safePage}
                pageParam="page"
                queryParams={{ q: query }}
                totalPages={totalPages}
              />
            ) : null}
          </div>
        </>
      ) : null}
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

function normalizeSearchText(value?: string | null): string {
  return value?.toLowerCase().trim() || ''
}

function getTimeValue(value?: string | null): number {
  if (!value) return 0

  const time = new Date(value).getTime()

  return Number.isNaN(time) ? 0 : time
}

function includesQuery(value: string | undefined | null, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) return false

  return normalizeSearchText(value).includes(normalizedQuery)
}

function getPostSearchRank(
  post: {
    meta?: {
      description?: string | null
      title?: string | null
    }
    title?: string | null
  },
  query: string,
): number {
  if (!query) return 2
  if (includesQuery(post.title, query)) return 0
  if (includesQuery(post.meta?.title, query)) return 0
  if (includesQuery(post.meta?.description, query)) return 1

  return 2
}

function getVideoSearchRank(video: { summary?: string | null; title?: string | null }, query: string): number {
  if (!query) return 2
  if (includesQuery(video.title, query)) return 0
  if (includesQuery(video.summary, query)) return 1

  return 2
}
