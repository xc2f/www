import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import React from 'react'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import MomentsFeed from './MomentsFeed'

import { Locale } from '@/i18n/types'
import { routing } from '@/i18n/routing'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { MomentsArchiveIntro } from './MomentsArchiveIntro'
import { queryMomentsPage } from './queries'

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
  const moments = await queryMomentsPage({ locale })

  const url = '/moments'
  const t = await getTranslations('Moments')

  return (
    <>
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="pb-24">
        <MomentsArchiveIntro
          eyebrow={t('eyebrow')}
          title={t('moments')}
          description={t('intro_description')}
          descriptionSecondLine={t('intro_description_second_line')}
        />

        <div className="container mt-6 sm:mt-7">
          <MomentsFeed
            initialMoments={moments.docs}
            initialNextPage={moments.nextPage}
            initialHasNextPage={moments.hasNextPage}
          />
        </div>
      </div>
    </>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Moments')
  return {
    title: t('moments'),
  }
}
