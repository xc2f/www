import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/types'
import { PostsArchive } from '../../PostsArchive'

type Args = {
  params: Promise<{
    pageNumber: string
    locale: Locale
  }>
}

export default async function Page({ params }: Args) {
  const { locale, pageNumber } = await params
  const page = Number(pageNumber)
  if (!/^\d+$/.test(pageNumber) || !Number.isSafeInteger(page) || page < 1) notFound()

  return <PostsArchive locale={locale} page={page} />
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber, locale } = await paramsPromise
  setRequestLocale(locale)
  const t = await getTranslations('Posts')
  return {
    title: t('page', {
      pageNumber,
    }),
  }
}
