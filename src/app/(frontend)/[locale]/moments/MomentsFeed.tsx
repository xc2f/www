'use client'

import React from 'react'
import MomentCard from './MomentCard'
import type { Media, Moment } from '@/payload-types'

export type MomentFeedItem = Pick<Moment, 'id' | 'content' | 'mood' | 'publishedAt'> & {
  title?: string | null
  images: {
    id: string
    image: Media
  }[]
}

interface MomentsFeedProps {
  moments: MomentFeedItem[]
}

export default function MomentsFeed({ moments }: MomentsFeedProps) {
  if (!moments?.length) {
    return (
      <div className="py-16 text-center text-sm text-slate-500 dark:text-white/42">
        暂无内容
      </div>
    )
  }

  return (
    <div>
      {moments.map((moment, index) => (
        <React.Fragment key={moment.id}>
          <MomentCard moment={moment} />
          {index < moments.length - 1 && (
            <div className="pointer-events-none h-px bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(148,163,184,0.14)_8%,rgba(148,163,184,0.24)_50%,rgba(148,163,184,0.14)_92%,rgba(148,163,184,0))] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.06)_8%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.06)_92%,rgba(255,255,255,0))]" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
