import type { Metadata } from 'next/types'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import MomentsFeed from './MomentsFeed'

import { Locale } from '@/i18n/types'
import { routing } from '@/i18n/routing'
import { setRequestLocale, getTranslations } from 'next-intl/server'

export const revalidate = 600

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Args = {
  params: Promise<{
    slug?: string
    locale: Locale
  }>
}

export default async function Page({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale } = await params

  // Enable static rendering
  setRequestLocale(locale)
  const moments = await queryMoments({ locale })

  const url = '/moments'

  return (
    <>
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="container mt-10 mb-10">
        <div className="prose dark:prose-invert max-w-none">
          <MomentsFeed moments={moments} />
        </div>
      </div>
    </>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const t = await getTranslations('Moments')
  return {
    title: t('moments'),
  }
}

const queryMoments = cache(async ({ locale }: { locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const moments = await payload.find({
    collection: 'moments',
    draft,
    depth: 1,
    limit: 50,
    overrideAccess: draft,
    locale,
    select: {
      title: true,
      mood: true,
      images: true,
      content: true,
      publishedAt: true,
    },
    where: {
      published: { equals: true },
    },
  })

  return moments.docs || []
})
