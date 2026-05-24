import React from 'react'
import { ArchiveHero } from '../ArchiveHero'

type SearchArchiveIntroProps = {
  children: React.ReactNode
  description: string
  descriptionSecondLine: string
  eyebrow: string
  title: string
}

export function SearchArchiveIntro({
  children,
  description,
  descriptionSecondLine,
  eyebrow,
  title,
}: SearchArchiveIntroProps) {
  return (
    <ArchiveHero
      className="search-archive-intro"
      description={description}
      descriptionSecondLine={descriptionSecondLine}
      eyebrow={eyebrow}
      layout="split"
      title={title}
    >
      {children}
    </ArchiveHero>
  )
}
