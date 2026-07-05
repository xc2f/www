import { ArchiveHero } from '../ArchiveHero'

type VideoArchiveIntroProps = {
  description: string
  descriptionSecondLine: string
  eyebrow: string
  title: string
}

export function VideoArchiveIntro({
  description,
  descriptionSecondLine,
  eyebrow,
  title,
}: VideoArchiveIntroProps) {
  return (
    <ArchiveHero
      description={description}
      descriptionSecondLine={descriptionSecondLine}
      eyebrow={eyebrow}
      title={title}
    />
  )
}
