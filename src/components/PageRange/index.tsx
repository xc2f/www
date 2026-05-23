import React from 'react'
import { useTranslations } from 'next-intl'

const defaultLabels = {
  plural: 'Docs',
  singular: 'Doc',
}

const defaultCollectionLabels = {
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
}

export const PageRange: React.FC<{
  className?: string
  collection?: keyof typeof defaultCollectionLabels
  collectionLabels?: {
    plural?: string
    singular?: string
  }
  currentPage?: number
  limit?: number
  totalDocs?: number
}> = (props) => {
  const t = useTranslations('Posts')
  const searchT = useTranslations('Search')
  const {
    className,
    collection,
    collectionLabels: collectionLabelsFromProps,
    currentPage,
    limit,
    totalDocs,
  } = props

  let indexStart = (currentPage ? currentPage - 1 : 1) * (limit || 1) + 1
  if (totalDocs && indexStart > totalDocs) indexStart = 0

  let indexEnd = (currentPage || 1) * (limit || 1)
  if (totalDocs && indexEnd > totalDocs) indexEnd = totalDocs

  const collectionLabels =
    collectionLabelsFromProps ||
    (collection ? defaultCollectionLabels[collection] : undefined) ||
    defaultLabels

  void collectionLabels

  const summary =
    typeof totalDocs !== 'undefined' && totalDocs > 0
      ? indexStart > 0
        ? t('pagination', {
            start: indexStart,
            end: indexEnd,
            total: totalDocs,
          })
        : t('pagination_0', {
            total: totalDocs,
          })
      : searchT('no_results')

  return (
    <div
      className={[
        className,
        'max-w-full py-2 text-sm text-slate-600 dark:text-white/50',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-[0.95rem] leading-6 tracking-[0.01em] text-slate-600 dark:text-white/52">
        {summary}
      </p>
    </div>
  )
}
