import React from 'react'
import { getTranslations } from 'next-intl/server'

import { ArchiveHero } from '../ArchiveHero'

type PostsArchiveIntroProps = {
  title: string
}

export async function PostsArchiveIntro({ title }: PostsArchiveIntroProps) {
  const t = await getTranslations('Posts')

  return (
    <ArchiveHero
      className="posts-archive-intro"
      description={t('intro_description')}
      descriptionSecondLine={t('intro_description_second_line')}
      eyebrow={t('eyebrow')}
      title={title}
    />
  )
}
