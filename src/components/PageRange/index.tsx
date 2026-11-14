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
  namespace?: 'Posts' | 'Search'
  totalDocs?: number
}> = (props) => {
  const {
    className,
    collection,
    collectionLabels: collectionLabelsFromProps,
    currentPage,
    limit,
    namespace = 'Posts',
    totalDocs,
  } = props
  const t = useTranslations(namespace)
  const searchT = useTranslations('Search')

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

  return <p className={['archive-page-range', className].filter(Boolean).join(' ')}>{summary}</p>
}
