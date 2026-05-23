import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'

type Args = {
  searchParams: Promise<{
    q: string
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

  const { q: query } = await searchParamsPromise
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
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
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

  const publishedAtByPostID = new Map<number, string | null | undefined>()

  if (postIDs.length > 0) {
    const indexedPosts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: postIDs.length,
      locale,
      overrideAccess: false,
      pagination: false,
      select: {
        publishedAt: true,
      },
      where: {
        id: {
          in: postIDs,
        },
      },
    })

    indexedPosts.docs.forEach((post) => {
      publishedAtByPostID.set(post.id, post.publishedAt)
    })
  }

  const archivePosts = posts.docs.map((doc) => {
    const relationDoc = typeof doc.doc?.value === 'object' ? doc.doc.value : null
    const relationID = relationDoc?.id || (typeof doc.doc?.value === 'number' ? doc.doc.value : null)

    return {
      categories: doc.categories?.map((category) => ({
        title: category?.title || undefined,
      })),
      meta: doc.meta,
      publishedAt:
        doc.publishedAt ||
        relationDoc?.publishedAt ||
        (relationID ? publishedAtByPostID.get(relationID) : undefined),
      slug: doc.slug || relationDoc?.slug || '',
      title: doc.title || relationDoc?.title || undefined,
    }
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">{t('search')}</h1>
          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={archivePosts as CardPostData[]} />
      ) : (
        <div className="container text-center">{t('empty')}</div>
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
