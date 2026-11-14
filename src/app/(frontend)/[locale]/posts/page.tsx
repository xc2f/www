import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/types'
import { PostsArchive } from './PostsArchive'

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return <PostsArchive locale={locale} />
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Posts')
  return {
    title: t('posts'),
  }
}
