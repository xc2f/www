import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import RichText from '@/components/RichText'
import ImageGrid from './ImageGrid'
import Mood from './Mood'
import type { MomentFeedItem } from './MomentsFeed'

interface MomentCardProps {
  moment: MomentFeedItem
}

type MomentContent = MomentFeedItem['content']

const trimTrailingEmptyParagraphs = (content: MomentContent) => {
  if (!content) return null

  // Lexical renders an empty paragraph as <p><br /></p>.
  const children = content.root.children ?? []
  let length = children.length
  while (length > 0) {
    const last = children[length - 1]
    if (last.type !== 'paragraph' || !Array.isArray(last.children) || last.children.length > 0)
      break
    length--
  }

  if (length === 0) return null
  if (length === children.length) return content

  return { ...content, root: { ...content.root, children: children.slice(0, length) } }
}

export default function MomentCard({ moment }: MomentCardProps) {
  const locale = useLocale()
  const t = useTranslations('Moments')
  const [showOriginal, setShowOriginal] = useState(false)

  const original = moment.original
  const canToggle = Boolean(moment.aiTranslated && original && (original.title || original.content))
  const showingOriginal = canToggle && showOriginal

  const title = showingOriginal ? original?.title : moment.title
  const content = trimTrailingEmptyParagraphs(
    showingOriginal ? original?.content : moment.content,
  )
  const contentLang = showingOriginal ? (locale === 'zh' ? 'en' : 'zh') : undefined
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
        {moment.aiTranslated && (
          <div className="archive-moment-translation">
            {canToggle ? (
              <button
                type="button"
                className="archive-moment-translation-toggle"
                role="switch"
                aria-checked={!showingOriginal}
                aria-label={t('translation_toggle_description')}
                title={t('translation_toggle_description')}
                onClick={() => setShowOriginal((current) => !current)}
              >
                <span className="archive-moment-translation-track" aria-hidden="true" />
                <span className="archive-moment-translation-label">
                  {showingOriginal ? t('original_text') : t('ai_translated')}
                </span>
              </button>
            ) : (
              <span className="archive-moment-translation-label">{t('ai_translated')}</span>
            )}
          </div>
        )}
      </div>
      <div className="min-w-0 space-y-3">
        {title && (
          <h2 className="text-xl font-medium" lang={contentLang}>
            {title}
          </h2>
        )}
        {content && (
          <div className="archive-moment-body" lang={contentLang}>
            <RichText
              data={content}
              enableGutter={false}
              className="max-w-none prose-p:my-2 prose-p:leading-relaxed"
            />
          </div>
        )}
        {hasImages && <ImageGrid images={moment.images} />}
      </div>
    </article>
  )
}
