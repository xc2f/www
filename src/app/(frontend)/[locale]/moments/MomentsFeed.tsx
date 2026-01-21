'use client'

import MomentCard from './MomentCard'

interface MomentsFeedProps {
  moments: any[]
}

export default function MomentsFeed({ moments }: MomentsFeedProps) {
  if (!moments?.length) {
    return <div className="py-16 text-center text-sm text-gray-500">暂无内容</div>
  }

  return (
    <div className="space-y-12">
      {moments.map((moment) => (
        <MomentCard key={moment.id} moment={moment} />
      ))}
    </div>
  )
}
