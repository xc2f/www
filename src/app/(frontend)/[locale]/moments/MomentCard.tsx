import ImageGrid from './ImageGrid'
import RichText from '@/components/RichText'
import { LocalTime } from '@/components/LocalTime'
import { useLocale } from 'next-intl'
import Mood from './Mood'
import { Locale } from '@/i18n/types'

interface MomentCardProps {
  moment: any
}

export default function MomentCard({ moment }: MomentCardProps) {
  const locale: Locale = useLocale() as Locale

  return (
    <article className="flex flex-col md:flex-row gap-4 md:gap-16">
      {/* 图片 */}
      <div className="md:basis-3/5 shrink-0">
        <ImageGrid images={moment.images} />
      </div>

      {/* 时间 + 心情 */}
      <div className="md:basis-2/5 space-y-3 group ">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <time>
            <LocalTime time={moment.publishedAt} locale={locale} />
          </time>
          {moment.mood && <Mood mood={moment.mood} />}
        </div>

        {/* 内容 */}
        {moment.content && <RichText data={moment.content} enableGutter={false} />}
      </div>
    </article>
  )
}
