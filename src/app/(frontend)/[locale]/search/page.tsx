import { ArchivePagination } from '../ArchivePagination'
import configPromise from '@payload-config'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ContentArchive } from '../ContentArchive'
import { SearchField } from './SearchField.client'
import { SearchResultsGrid, type SearchResult } from './SearchResultsGrid'

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
  if (!query) {
    return (
      <ContentArchive title={t('search')} intro={<SearchForm locale={locale} query={query} />}>
        <PageClient />
      </ContentArchive>
    )
  }

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
      meta: true,
      publishedAt: true,
      tags: true,
      title: true,
    },
    where: {
      and: [{ 'doc.relationTo': { equals: 'posts' } }, ...(searchWhere ? [searchWhere] : [])],
    },
  })

  const sortedSearchResults = results.docs
    .flatMap<RankedSearchResult>((searchDoc) => {
      const relation = searchDoc.doc

      if (relation?.relationTo === 'posts' && relation.value != null) {
        const post = {
          categories: searchDoc.categories?.map((category) => ({
            title: category?.title || undefined,
          })),
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
            postID: typeof relation.value === 'object' ? relation.value.id : relation.value,
            post: post as CardPostData,
            score: getPostSearchScore(post, queryTerms),
            sortDate: post.publishedAt,
            type: 'post' as const,
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
  const covers = new Map<number, CardPostData['heroImage']>()
  if (resultCount > 0) {
    const { docs } = await payload.find({
      collection: 'posts',
      depth: 1,
      locale,
      overrideAccess: false,
      pagination: false,
      select: { heroImage: true },
      where: { id: { in: searchResults.map(({ postID }) => postID) } },
    })
    for (const post of docs) covers.set(post.id, post.heroImage)
  }

  const resultsWithCovers = searchResults.map((result) => ({
    ...result,
    post: { ...result.post, heroImage: covers.get(result.postID) },
  }))

  return (
    <ContentArchive
      className="content-archive-compact"
      title={t('search')}
      intro={
        <>
          <SearchForm locale={locale} query={query} />
          <p className="archive-page-range">
            {resultCount
              ? t('results_for', { count: totalResults, query })
              : t('empty_with_query', { query })}
          </p>
        </>
      }
    >
      <PageClient />
      {resultCount > 0 && <SearchResultsGrid results={resultsWithCovers} locale={locale} />}
      {totalPages > 1 && (
        <ArchivePagination page={safePage} totalPages={totalPages} query={query} />
      )}
    </ContentArchive>
  )
}

async function SearchForm({ locale, query }: { locale: Locale; query: string }) {
  const t = await getTranslations('Search')
  return (
    <form className="archive-search" action={`/${locale}/search`} method="get" role="search">
      <label className="sr-only" htmlFor="archive-search-query">
        {t('query_label')}
      </label>
      <SearchField query={query} placeholder={t('enter')} clearLabel={t('clear')} />
      <button type="submit">{t('search')}</button>
    </form>
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
  return (
    value
      ?.toLowerCase()
      .replace(/[-_/]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || ''
  )
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
