import ImageGrid from './ImageGrid'
import RichText from '@/components/RichText'
import { useLocale } from 'next-intl'
import Mood from './Mood'
import type { MomentFeedItem } from './MomentsFeed'

interface MomentCardProps {
  moment: MomentFeedItem
}

export default function MomentCard({ moment }: MomentCardProps) {
  const locale = useLocale()
  const hasImages = moment.images.length > 0
  const content = moment.content
  // Lexical renders an empty paragraph as <p><br /></p>.
  const children = content?.root.children ?? []
  let contentLength = children.length
  while (contentLength > 0) {
    const last = children[contentLength - 1]
    if (last.type !== 'paragraph' || !Array.isArray(last.children) || last.children.length > 0)
      break
    contentLength--
  }

  const date = moment.publishedAt ? new Date(moment.publishedAt) : null
  return (
    <article className="archive-moment">
      <div className="archive-moment-meta">
        {date && Number.isFinite(date.getTime()) && (
          <time dateTime={moment.publishedAt ?? undefined}>
            {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)}
          </time>
        )}
        {moment.mood && <Mood mood={moment.mood} />}
      </div>
      <div className="min-w-0 space-y-3">
        {moment.title && <h2 className="text-xl font-medium">{moment.title}</h2>}
        {content && contentLength > 0 && (
          <RichText
            data={
              contentLength === children.length
                ? content
                : {
                    ...content,
                    root: { ...content.root, children: children.slice(0, contentLength) },
                  }
            }
            enableGutter={false}
            className="max-w-none prose-p:my-2 prose-p:leading-relaxed"
          />
        )}
        {hasImages && <ImageGrid images={moment.images} />}
      </div>
    </article>
  )
}
