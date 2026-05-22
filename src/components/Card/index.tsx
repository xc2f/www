'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:cursor-pointer dark:shadow-[0_10px_28px_rgba(0,0,0,0.32)]',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5">
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            fill
            imgClassName="object-cover"
            pictureClassName="absolute inset-0"
            resource={metaImage}
            size="33vw"
          />
        )}
        {(!metaImage || typeof metaImage === 'string') && (
          <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,rgba(7,10,16,0.96),rgba(10,14,22,0.88)_54%,rgba(14,18,24,0.74)_100%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(255,255,255,0.1),transparent_16%),radial-gradient(circle_at_68%_34%,rgba(125,215,255,0.12),transparent_22%),radial-gradient(circle_at_52%_76%,rgba(255,143,114,0.09),transparent_20%),radial-gradient(circle_at_46%_46%,rgba(255,255,255,0.035),transparent_32%)]" />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(180deg,transparent,transparent_15px,rgba(255,255,255,0.025)_16px)] [background-size:100%_16px]" />
            <div className="absolute left-[18%] top-[18%] h-28 w-28 rounded-full bg-[#ff8f72]/8 blur-3xl" />
            <div className="absolute right-[16%] top-[26%] h-36 w-36 rounded-full bg-[#7dd7ff]/10 blur-[72px]" />
            <div className="absolute inset-x-[20%] top-[22%] h-24 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_72%)] blur-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(4,6,10,0.18)_72%,rgba(2,4,8,0.4)_100%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.42em] text-white/44">
                <span className="absolute left-[-1.1rem] top-1/2 h-px w-5 -translate-y-1/2 bg-gradient-to-r from-transparent to-cyan-100/35" />
                <span className="absolute right-[-1.1rem] top-1/2 h-px w-5 -translate-y-1/2 bg-gradient-to-l from-transparent to-white/20" />
                <span className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_72%)] blur-xl" />
                <span className="relative translate-y-[0.02em] text-white/55">X</span>
                <span className="relative text-[#ff8f72]/70">C</span>
                <span className="relative text-white/42">2</span>
                <span className="relative text-[#7dd7ff]/70">F</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.04)_72%,rgba(255,255,255,0.08))]" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col bg-card p-4 text-card-foreground">
        {showCategories && hasCategories && (
          <div className="mb-4 text-sm uppercase text-muted-foreground">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div>
            <h3 className="text-xl font-normal leading-snug text-card-foreground">
              <Link
                className="text-card-foreground transition-colors hover:text-muted-foreground"
                href={href}
                ref={link.ref}
              >
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && (
          <div className="mt-2 text-muted-foreground">
            {description && <p>{sanitizedDescription}</p>}
          </div>
        )}
      </div>
    </article>
  )
}
