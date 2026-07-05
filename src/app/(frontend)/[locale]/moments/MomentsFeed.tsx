'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
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
  initialMoments: MomentFeedItem[]
  initialHasNextPage?: boolean | null
  initialNextPage?: number | null
}

type MomentsFeedResponse = {
  docs: MomentFeedItem[]
  hasNextPage?: boolean | null
  nextPage?: number | null
}

export default function MomentsFeed({
  initialMoments,
  initialHasNextPage,
  initialNextPage,
}: MomentsFeedProps) {
  const locale = useLocale()
  const t = useTranslations('Moments')
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [moments, setMoments] = useState(initialMoments)
  const [hasNextPage, setHasNextPage] = useState(Boolean(initialHasNextPage))
  const [nextPage, setNextPage] = useState(initialNextPage ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setMoments(initialMoments)
    setHasNextPage(Boolean(initialHasNextPage))
    setNextPage(initialNextPage ?? null)
    setIsLoading(false)
    setHasError(false)
  }, [initialHasNextPage, initialMoments, initialNextPage])

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || !nextPage || isLoading) {
      return
    }

    setIsLoading(true)
    setHasError(false)

    try {
      const response = await fetch(`/${locale}/moments/feed?page=${nextPage}`, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load moments')
      }

      const data = (await response.json()) as MomentsFeedResponse

      setMoments((currentMoments) => {
        const existingIDs = new Set(currentMoments.map((moment) => moment.id))
        const nextMoments = data.docs.filter((moment) => !existingIDs.has(moment.id))

        return [...currentMoments, ...nextMoments]
      })
      setHasNextPage(Boolean(data.hasNextPage))
      setNextPage(data.nextPage ?? null)
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [hasNextPage, isLoading, locale, nextPage])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel || !hasNextPage || hasError) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadNextPage()
        }
      },
      {
        rootMargin: '360px 0px',
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasError, hasNextPage, loadNextPage])

  if (!moments?.length) {
    return (
      <div className="py-16 text-center text-sm text-slate-500 dark:text-white/42">
        {t('empty')}
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

      {(hasNextPage || isLoading || hasError) && (
        <div
          ref={sentinelRef}
          className="flex min-h-20 items-center justify-center py-6 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-white/34"
        >
          {hasError ? (
            <button
              className="transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:hover:text-white/72 dark:focus-visible:ring-white/20"
              onClick={() => void loadNextPage()}
              type="button"
            >
              {t('load_retry')}
            </button>
          ) : isLoading ? (
            t('loading')
          ) : (
            <span aria-hidden="true">· · ·</span>
          )}
        </div>
      )}
    </div>
  )
}
