import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  className?: string
  gridClassName?: string
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { className, gridClassName, posts } = props

  return (
    <div className={cn('container', className)}>
      <div>
        <div
          className={cn(
            'grid grid-cols-4 gap-x-4 gap-y-5 sm:grid-cols-8 sm:gap-y-6 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-8 xl:gap-x-7 xl:gap-y-10',
            gridClassName,
          )}
        >
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4 md:col-span-4 lg:col-span-6 xl:col-span-4" key={index}>
                  <Card className="h-full" doc={result} relationTo="posts" showCategories />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
