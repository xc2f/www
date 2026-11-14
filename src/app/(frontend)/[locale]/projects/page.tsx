import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/types'

import { ArchiveEntry, ContentArchive } from '../ContentArchive'

const projects = [
  { key: 'bingWallpapers', href: 'https://bing.xc2f.com' },
  { key: 'videoSubtitles', href: 'https://github.com/xc2f/video-subtitles' },
] as const

type Props = { params: Promise<{ locale: Locale }> }

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Projects')

  return (
    <ContentArchive title={t('title')}>
      <ul className="archive-list">
        {projects.map(({ key, href }) => (
          <ArchiveEntry
            key={key}
            href={href}
            title={t(`items.${key}.title`)}
            description={t(`items.${key}.description`)}
            locale={locale}
            external
          />
        ))}
      </ul>
    </ContentArchive>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Projects' })

  return { title: t('title'), description: t('description') }
}
