import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import React from 'react'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import MomentsFeed from './MomentsFeed'
import LiveMomentsFeed from './LiveMomentsFeed'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ContentArchive } from '../ContentArchive'
import { queryMomentsPage } from './queries'

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

      <ContentArchive
        className="content-archive-compact"
        title={t('moments')}
        intro={<p>{t('intro_description')}</p>}
      >
        {draft ? (
          <LiveMomentsFeed
            initialMoments={moments.docs}
            initialNextPage={moments.nextPage}
            initialHasNextPage={moments.hasNextPage}
          />
        ) : (
          <MomentsFeed
            initialMoments={moments.docs}
            initialNextPage={moments.nextPage}
            initialHasNextPage={moments.hasNextPage}
          />
        )}
      </ContentArchive>
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
