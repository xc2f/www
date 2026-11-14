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
  const pendingRequest = useRef<AbortController | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setMoments(initialMoments)
    setHasNextPage(Boolean(initialHasNextPage))
    setNextPage(initialNextPage ?? null)
    setIsLoading(false)
    setHasError(false)

    return () => {
      pendingRequest.current?.abort()
      pendingRequest.current = null
    }
  }, [initialHasNextPage, initialMoments, initialNextPage, locale])

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || !nextPage || isLoading || pendingRequest.current) {
      return
    }

    const request = new AbortController()
    pendingRequest.current = request
    setIsLoading(true)
    setHasError(false)

    try {
      const response = await fetch(`/${locale}/moments/feed?page=${nextPage}`, {
        signal: request.signal,
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load moments')
      }

      const data = (await response.json()) as MomentsFeedResponse

      if (pendingRequest.current !== request) return

      setMoments((currentMoments) => {
        const existingIDs = new Set(currentMoments.map((moment) => moment.id))
        const nextMoments = data.docs.filter((moment) => !existingIDs.has(moment.id))

        return [...currentMoments, ...nextMoments]
      })
      setHasNextPage(Boolean(data.hasNextPage))
      setNextPage(data.nextPage ?? null)
    } catch {
      if (pendingRequest.current === request) setHasError(true)
    } finally {
      if (pendingRequest.current === request) {
        pendingRequest.current = null
        setIsLoading(false)
      }
    }
  }, [hasNextPage, isLoading, locale, nextPage])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel || !hasNextPage || hasError || typeof IntersectionObserver === 'undefined') {
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
    return <div className="archive-note">{t('empty')}</div>
  }

  return (
    <div>
      <ul className="archive-moments">
        {moments.map((moment) => (
          <li key={moment.id}>
            <MomentCard moment={moment} />
          </li>
        ))}
      </ul>

      <div className="archive-feed-controls" ref={sentinelRef}>
        <span role="status">{isLoading ? t('loading') : hasError ? t('load_failed') : ''}</span>
        {hasNextPage && (
          <button
            aria-disabled={isLoading}
            className="archive-feed-more"
            onClick={() => void loadNextPage()}
            type="button"
          >
            {hasError ? t('retry') : t('load_more')}
          </button>
        )}
      </div>
    </div>
  )
}
