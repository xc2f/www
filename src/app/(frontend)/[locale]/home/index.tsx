import type { RequiredDataFromCollectionSlug } from 'payload'

import { BookOpen, ChevronRight, Clock3, Shapes } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Link } from '@/i18n/navigation'

import { HomeInk } from './HomeInk.client'
import './home.css'

type HomePageProps = {
  draft: boolean
  page: RequiredDataFromCollectionSlug<'pages'>
}

const archives = [
  { key: 'posts', Icon: BookOpen },
  { key: 'moments', Icon: Clock3 },
  { key: 'projects', Icon: Shapes },
] as const

export async function HomePage({ draft }: HomePageProps) {
  const t = await getTranslations('Home')

  return (
    <main className="home-index" id="main-content">
      {draft && <LivePreviewListener />}

      <div className="home-index-inner home-index-grid home-index-grid-ink">
        <h1 className="sr-only">{t('archive.label')}</h1>

        <nav className="home-index-archives" aria-label={t('archive.label')}>
          <ul>
            {archives.map(({ key: archive, Icon }) => (
              <li key={archive}>
                <Link href={`/${archive}`} className="home-index-link">
                  <Icon
                    className="home-index-entry-icon"
                    aria-hidden="true"
                    size={23}
                    strokeWidth={1.25}
                  />
                  <span className="home-index-link-title">{t(`archive.${archive}.title`)}</span>
                  <span className="home-index-link-description">
                    {t(`archive.${archive}.description`)}
                  </span>
                  <ChevronRight
                    className="home-index-entry-arrow"
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.4}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <HomeInk />
      </div>
    </main>
  )
}
