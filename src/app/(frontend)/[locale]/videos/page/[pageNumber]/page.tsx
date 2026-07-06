import type { Metadata } from 'next'

import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'

import type { Locale } from '@/i18n/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import PageClient from '../../page.client'
import { queryPublishedVideos } from '../../queries'
import { createVideosMetadata } from '../../videoMeta'
import { VideoArchiveIntro } from '../../VideoArchiveIntro'
import { VideoGrid } from '../../VideoGrid'

type Args = {
  params: Promise<{
    locale: Locale
    pageNumber: string
  }>
}

export default async function Page({ params }: Args) {
  const { locale, pageNumber } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Videos')
  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) notFound()

  const videos = await queryPublishedVideos({ locale, page: sanitizedPageNumber })

  if (sanitizedPageNumber > videos.totalPages && videos.totalPages > 0) notFound()

  return (
    <div className="pb-24">
      <PageClient />
      <VideoArchiveIntro
        description={t('intro_description')}
        descriptionSecondLine={t('intro_description_second_line')}
        eyebrow={t('eyebrow')}
        title={t('videos')}
      />

      <div className="container mt-6 sm:mt-7">
        <div className="grid grid-cols-4 gap-x-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-6 xl:gap-x-7">
          <div className="col-span-4 md:col-span-4 lg:col-span-6 xl:col-span-4">
            <PageRange
              currentPage={videos.page}
              limit={12}
              namespace="Videos"
              totalDocs={videos.totalDocs}
            />
          </div>
        </div>
      </div>

      <VideoGrid className="mt-6 sm:mt-7" videos={videos.docs} />

      <div className="container">
        {videos.page && videos.totalPages > 1 ? (
          <Pagination
            basePath="/videos"
            className="mt-14"
            page={videos.page}
            totalPages={videos.totalPages}
          />
        ) : null}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale, pageNumber } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Videos')

  return createVideosMetadata({
    description: t('intro_description'),
    title: t('page', { pageNumber }),
    url: `/${locale}/videos/page/${pageNumber}`,
  })
}
