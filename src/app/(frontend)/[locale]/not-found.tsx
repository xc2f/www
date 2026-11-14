import { ArrowLeft, Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { ContentArchive } from './ContentArchive'

export default async function NotFound() {
  const t = await getTranslations('Status.notFound')
  const search = await getTranslations('Search')

  return (
    <ContentArchive title={`404 · ${t('title')}`} intro={<p>{t('description')}</p>}>
      <div className="archive-recovery">
        <Link href="/">
          <ArrowLeft aria-hidden="true" size={17} strokeWidth={1.5} />
          {t('action')}
        </Link>
        <Link href="/search">
          <Search aria-hidden="true" size={17} strokeWidth={1.5} />
          {search('search')}
        </Link>
      </div>
    </ContentArchive>
  )
}
