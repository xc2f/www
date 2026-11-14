import { getTranslations } from 'next-intl/server'

import type { CardPostData } from '@/components/Card'
import type { Locale } from '@/i18n/types'
import type { Media } from '@/payload-types'

import { ArchiveEntry } from '../ContentArchive'

export type SearchVideoData = {
  cover?: Media | null
  href?: string | null
  originalAuthor?: string | null
  publishedAt?: string | null
  summary?: string | null
  tags?: { title?: string | null }[] | null
  title?: string | null
  topic?: {
    title?: string | null
  } | null
}

export type SearchResult =
  | {
      id: string
      post: CardPostData
      type: 'post'
    }
  | {
      id: string
      type: 'video'
      video: SearchVideoData
    }

export async function SearchResultsGrid({
  results,
  locale,
}: {
  results: SearchResult[]
  locale: Locale
}) {
  const posts = await getTranslations('Posts')
  const videos = await getTranslations('Videos')

  return (
    <ul className="archive-list">
      {results.map((result) => {
        if (result.type === 'post') {
          const { post } = result
          return (
            <ArchiveEntry
              key={result.id}
              locale={locale}
              kind={posts('posts')}
              href={post.slug ? `/posts/${post.slug}` : undefined}
              title={post.title}
              description={post.meta?.description}
              date={post.publishedAt}
              image={post.heroImage}
            />
          )
        }
        const { video } = result
        return (
          <ArchiveEntry
            key={result.id}
            locale={locale}
            kind={videos('video')}
            href={video.href}
            title={video.title}
            description={video.summary}
            date={video.publishedAt}
            image={video.cover}
          />
        )
      })}
    </ul>
  )
}
