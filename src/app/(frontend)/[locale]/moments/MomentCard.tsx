import ImageGrid from './ImageGrid'
import RichText from '@/components/RichText'
import { useLocale } from 'next-intl'
import { LocalTime } from '../../components/LocalTime'

import { Locale } from '@/i18n/types'
interface MomentCardProps {
  moment: any
}

const MOOD_MAP: Record<string, { label: string; emoji: string }> = {
  happy: { label: '开心', emoji: '😊' },
  calm: { label: '平静', emoji: '😌' },
  thoughtful: { label: '思考', emoji: '🤔' },
  tired: { label: '疲惫', emoji: '😴' },
  sad: { label: '低落', emoji: '😢' },
  energized: { label: '充实', emoji: '🔥' },
  content: { label: '满足', emoji: '😎' },
  neutral: { label: '无感', emoji: '😐' },
}

export default function MomentCard({ moment }: MomentCardProps) {
  const mood = moment.mood ? MOOD_MAP[moment.mood] : null
  const locale: Locale = useLocale() as Locale

  return (
    <article className="space-y-4">
      {/* 时间 + 心情 */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <time>
          <LocalTime date={moment.publishedAt} locale={locale} />
        </time>
        {mood && (
          <span title={mood.label} className="flex items-center gap-1">
            <span>{mood.emoji}</span>
          </span>
        )}
      </div>

      {/* 图片 */}
      {moment.images?.length > 0 && <ImageGrid images={moment.images} />}

      {/* 内容 */}
      {moment.content && (
        <div className="prose prose-sm max-w-none">
          <RichText className="max-w-[48rem] mx-auto" data={moment.content} enableGutter={false} />
        </div>
      )}
    </article>
  )
}
