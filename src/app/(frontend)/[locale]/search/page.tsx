import type { Metadata } from 'next/types'

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
  params: {
    locale: Locale
  }
}

export default async function Page({
  searchParams: searchParamsPromise,
  params: { locale },
}: Args) {
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
      title: true,
      slug: true,
      categories: true,
      meta: true,
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
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container text-center">{t('empty')}</div>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const t = await getTranslations('Search')
  return {
    title: t('search'),
  }
}
