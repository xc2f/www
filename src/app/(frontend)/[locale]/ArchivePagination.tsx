import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

export async function ArchivePagination({
  page,
  totalPages,
  query,
}: {
  page: number
  totalPages: number
  query?: string
}) {
  const t = await getTranslations('ArchivePagination')
  const href = (target: number) => {
    if (query === undefined) return target === 1 ? '/posts' : `/posts/page/${target}`
    const params = new URLSearchParams({ q: query })
    if (target > 1) params.set('page', String(target))
    return `/search?${params}`
  }

  return (
    <nav className="archive-pagination" aria-label={t('label')}>
      {page > 1 && <Link href={href(page - 1)}>{t('previous')}</Link>}
      <span aria-current="page">{t('range', { page, totalPages })}</span>
      {page < totalPages && <Link href={href(page + 1)}>{t('next')}</Link>}
    </nav>
  )
}
