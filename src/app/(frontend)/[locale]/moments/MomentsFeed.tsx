'use client'

import React from 'react'
import MomentCard from './MomentCard'
import type { Media, Moment } from '@/payload-types'

export type MomentFeedItem = Pick<Moment, 'id' | 'content' | 'mood' | 'publishedAt'> & {
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
    return <div className="py-16 text-center text-sm text-gray-500">暂无内容</div>
  }

  return (
    <div className="space-y-12">
      {moments.map((moment, index) => (
        <React.Fragment key={moment.id}>
          {index > 0 && <div className="h-px w-full bg-gray-200 dark:bg-gray-700" />}
          <MomentCard moment={moment} />
        </React.Fragment>
      ))}
    </div>
  )
}
