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
        {moment.content && (
          <RichText
            data={moment.content}
            enableGutter={false}
            className="max-w-none prose-p:leading-relaxed"
          />
        )}
        {hasImages && <ImageGrid images={moment.images} />}
      </div>
    </article>
  )
}
