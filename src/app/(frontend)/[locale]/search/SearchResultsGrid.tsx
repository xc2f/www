import { getTranslations } from 'next-intl/server'

import type { CardPostData } from '@/components/Card'
import type { Locale } from '@/i18n/types'

import { ArchiveEntry } from '../ContentArchive'

export type SearchResult = {
  id: string
  postID: number
  post: CardPostData
  type: 'post'
}

export async function SearchResultsGrid({
  results,
  locale,
}: {
  results: SearchResult[]
  locale: Locale
}) {
  const posts = await getTranslations('Posts')

  return (
    <ul className="archive-list">
      {results.map(({ id, post }) => (
        <ArchiveEntry
          key={id}
          locale={locale}
          kind={posts('posts')}
          href={post.slug ? `/posts/${post.slug}` : undefined}
          title={post.title}
          description={post.meta?.description}
          date={post.publishedAt}
          image={post.heroImage}
        />
      ))}
    </ul>
  )
}
