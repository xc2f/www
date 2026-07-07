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
import { SearchResultsGrid, type SearchResult, type SearchVideoData } from './SearchResultsGrid'

type Args = {
  searchParams: Promise<{
    page?: string
    q?: string
  }>
  params: Promise<{
    locale: Locale
  }>
}

type RankedSearchResult = SearchResult & {
  score: number
  sortDate?: string | null
}

const SEARCH_FIELDS = [
  'title',
  'meta.title',
  'meta.description',
  'slug',
  'categories.title',
  'tags.title',
  'summary',
  'originalTitle',
  'originalAuthor',
  'topic.title',
  'topic.slug',
] as const

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
  const queryTerms = getSearchTerms(query)
  const parsedPage = Number(rawPage)
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const pageSize = 12
  const payload = await getPayload({ config: configPromise })

  const searchWhere = buildSearchWhere(queryTerms)

  const results = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 0,
    locale,
    overrideAccess: false,
    pagination: false,
    select: {
      doc: true,
      slug: true,
      categories: true,
      cover: true,
      heroImage: true,
      meta: true,
      originalAuthor: true,
      originalTitle: true,
      publishedAt: true,
      summary: true,
      tags: true,
      title: true,
      topic: true,
    },
    ...(searchWhere ? { where: searchWhere } : {}),
  })

  const sortedSearchResults = results.docs
    .flatMap<RankedSearchResult>((searchDoc) => {
      const relationTo = searchDoc.doc?.relationTo

      if (relationTo === 'posts') {
        const post = {
          categories: searchDoc.categories?.map((category) => ({
            title: category?.title || undefined,
          })),
          heroImage: searchDoc.heroImage,
          meta: searchDoc.meta,
          publishedAt: searchDoc.publishedAt,
          slug: searchDoc.slug || '',
          tags:
            searchDoc.tags?.map((tag: { title?: string | null }) => ({
              title: tag?.title || undefined,
            })) || [],
          title: searchDoc.title || undefined,
        }

        return [
          {
            id: `post-${searchDoc.id}`,
            post: post as CardPostData,
            score: getPostSearchScore(post, queryTerms),
            sortDate: post.publishedAt,
            type: 'post' as const,
          },
        ]
      }

      if (relationTo === 'videos') {
        const video: SearchVideoData = {
          cover: typeof searchDoc.cover === 'object' ? searchDoc.cover : null,
          href: getVideoSearchPath(searchDoc),
          originalAuthor: searchDoc.originalAuthor,
          publishedAt: searchDoc.publishedAt,
          summary: searchDoc.summary,
          tags:
            searchDoc.tags?.map((tag: { title?: string | null }) => ({
              title: tag?.title || undefined,
            })) || [],
          title: searchDoc.title,
          topic: searchDoc.topic,
        }

        return [
          {
            id: `video-${searchDoc.id}`,
            score: getVideoSearchScore(searchDoc, queryTerms),
            sortDate: searchDoc.publishedAt,
            type: 'video' as const,
            video,
          },
        ]
      }

      return []
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score

      const timeDifference = getTimeValue(b.sortDate) - getTimeValue(a.sortDate)

      if (timeDifference !== 0) return timeDifference

      return a.id.localeCompare(b.id)
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
  return value?.toLowerCase().replace(/[-_/]+/g, ' ').replace(/\s+/g, ' ').trim() || ''
}

function getSearchTerms(query: string): string[] {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) return []

  return [...new Set(normalizedQuery.split(' ').filter(Boolean))]
}

function buildSearchWhere(queryTerms: string[]): Where | undefined {
  if (queryTerms.length === 0) return undefined

  return {
    and: queryTerms.map((term) => ({
      or: SEARCH_FIELDS.map((field) => ({
        [field]: {
          like: term,
        },
      })),
    })),
  }
}

function getTimeValue(value?: string | null): number {
  if (!value) return 0

  const time = new Date(value).getTime()

  return Number.isNaN(time) ? 0 : time
}

function getRelationTitle(item: unknown): string | null {
  if (!item || typeof item !== 'object' || !('title' in item)) {
    return null
  }

  const title = (item as { title?: unknown }).title

  return typeof title === 'string' ? title : null
}

function getVideoSearchPath(searchDoc: {
  slug?: string | null
  topic?: {
    slug?: string | null
  } | null
}): string | null {
  if (!searchDoc.topic?.slug || !searchDoc.slug) {
    return null
  }

  return `/videos/${searchDoc.topic.slug}/${searchDoc.slug}`
}

function scoreText(value: string | undefined | null, queryTerms: string[]): number {
  if (!value || queryTerms.length === 0) return 0

  const normalizedValue = normalizeSearchText(value)
  if (!normalizedValue) return 0

  const exactQuery = queryTerms.join(' ')
  let score = 0

  if (normalizedValue === exactQuery) {
    score += 160
  } else if (normalizedValue.startsWith(exactQuery)) {
    score += 125
  } else if (normalizedValue.includes(exactQuery)) {
    score += 90
  }

  for (const term of queryTerms) {
    if (normalizedValue === term) {
      score += 45
    } else if (normalizedValue.startsWith(term)) {
      score += 34
    } else if (normalizedValue.split(' ').some((word) => word.startsWith(term))) {
      score += 24
    } else if (normalizedValue.includes(term)) {
      score += 14
    }
  }

  return score
}

function scoreTextList(
  values: (string | undefined | null)[] | undefined | null,
  queryTerms: string[],
): number {
  return values?.reduce((score, value) => score + scoreText(value, queryTerms), 0) || 0
}

function getPostSearchScore(
  post: {
    categories?: { title?: string | null }[] | null
    meta?: {
      description?: string | null
      title?: string | null
    }
    slug?: string | null
    tags?: { title?: string | null }[] | null
    title?: string | null
  },
  queryTerms: string[],
): number {
  if (queryTerms.length === 0) return 0

  return (
    scoreText(post.title, queryTerms) * 5 +
    scoreText(post.meta?.title, queryTerms) * 4 +
    scoreText(post.slug, queryTerms) * 3 +
    scoreTextList(
      post.categories?.map((category) => category.title),
      queryTerms,
    ) *
      2 +
    scoreTextList(
      post.tags?.map((tag) => tag.title),
      queryTerms,
    ) *
      2 +
    scoreText(post.meta?.description, queryTerms)
  )
}

function getVideoSearchScore(
  video: {
    originalAuthor?: string | null
    originalTitle?: string | null
    slug?: string | null
    summary?: string | null
    tags?: unknown[] | null
    title?: string | null
    topic?: unknown
  },
  queryTerms: string[],
): number {
  if (queryTerms.length === 0) return 0

  return (
    scoreText(video.title, queryTerms) * 5 +
    scoreText(video.originalTitle, queryTerms) * 4 +
    scoreText(video.slug, queryTerms) * 3 +
    scoreText(getRelationTitle(video.topic), queryTerms) * 2 +
    scoreTextList(video.tags?.map(getRelationTitle), queryTerms) * 2 +
    scoreText(video.summary, queryTerms) +
    scoreText(video.originalAuthor, queryTerms)
  )
}
