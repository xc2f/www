import React from 'react'
import { ArchiveHero } from '../ArchiveHero'

type MomentsArchiveIntroProps = {
  eyebrow: string
  title: string
  description: string
  descriptionSecondLine: string
}

export function MomentsArchiveIntro({
  eyebrow,
  title,
  description,
  descriptionSecondLine,
}: MomentsArchiveIntroProps) {
  return (
    <ArchiveHero
      description={description}
      descriptionSecondLine={descriptionSecondLine}
      eyebrow={eyebrow}
      title={title}
    />
  )
}
