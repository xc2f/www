import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import MomentsFeed from './MomentsFeed'
import { Locale } from '@/i18n/types'
import { routing } from '@/i18n/routing'
import { setRequestLocale } from 'next-intl/server'

export const revalidate = 600

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  // Enable static rendering
  setRequestLocale(locale)

  const payload = await getPayload({ config: configPromise })

  const moments = await payload.find({
    collection: 'moments',
    depth: 1,
    limit: 10,
    overrideAccess: false,
    locale,
    select: {
      title: true,
      mood: true,
      images: true,
      content: true,
      publishedAt: true,
    },
  })

  return (
    <>
      <PageClient />
      <div className="container mt-10 mb-10">
        <div className="prose dark:prose-invert max-w-none">
          <MomentsFeed moments={moments.docs} />
        </div>
      </div>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Moments`,
  }
}
