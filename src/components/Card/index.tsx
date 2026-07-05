import React from 'react'

import type { Post } from '@/payload-types'

import { ArchiveCard } from '@/components/ArchiveCard'

export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'heroImage' | 'meta' | 'publishedAt' | 'tags' | 'title'
>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { className, doc, relationTo = 'posts', showCategories, title: titleFromProps } = props

  const { categories, heroImage, meta, publishedAt, tags, title } = doc || {}
  const { description, image: metaImage } = meta || {}
  const cardImage =
    metaImage && typeof metaImage === 'object'
      ? metaImage
      : heroImage && typeof heroImage === 'object'
        ? heroImage
        : null
  const categoryTitle = categories?.find((category) => typeof category === 'object')?.title
  const tagTitles =
    tags?.flatMap((tag) => {
      if (typeof tag !== 'object' || tag === null) return []

      return tag.title ? [tag.title] : []
    }) ?? []

  return (
    <ArchiveCard
      className={className}
      description={description}
      href={`/${relationTo}/${doc?.slug}`}
      image={cardImage}
      placeholderLabel="XC2F"
      publishedAt={publishedAt}
      tags={tagTitles}
      title={titleFromProps || title}
      topLabel={showCategories ? categoryTitle : undefined}
    />
  )
}
