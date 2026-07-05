'use client'
import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/utilities/ui'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

export const Pagination: React.FC<{
  basePath?: string
  className?: string
  page: number
  pageParam?: string
  queryParams?: Record<string, string | number | undefined>
  totalPages: number
}> = (props) => {
  const router = useRouter()
  const pathname = usePathname()

  const { basePath = '/posts', className, page, pageParam, queryParams, totalPages } = props
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages
  const localePrefix = pathname.match(/^\/(en|zh)(?=\/|$)/)?.[0] || ''

  const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`
  const getHref = (targetPage: number) => {
    const pathname =
      targetPage <= 1 || pageParam
        ? `${localePrefix}${normalizedBasePath}` || normalizedBasePath
        : `${localePrefix}${normalizedBasePath}/page/${targetPage}`

    const params = new URLSearchParams()

    Object.entries(queryParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value))
      }
    })

    if (pageParam && targetPage > 1) {
      params.set(pageParam, String(targetPage))
    }

    const query = params.toString()

    return query ? `${pathname}?${query}` : pathname
  }

  return (
    <div className={cn('my-12', className)}>
      <PaginationComponent>
        <PaginationContent className="flex-wrap gap-2">
          <PaginationItem>
            <PaginationPrevious
              className="rounded-full border border-black/8 bg-white/72 text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/72 dark:shadow-[0_14px_40px_rgba(0,0,0,0.28)] dark:hover:bg-white/[0.06]"
              disabled={!hasPrevPage}
              onClick={() => {
                router.push(getHref(page - 1))
              }}
            />
          </PaginationItem>

          {hasExtraPrevPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {hasPrevPage && (
            <PaginationItem>
              <PaginationLink
                className="rounded-full border border-transparent bg-transparent text-slate-600 transition hover:-translate-y-0.5 hover:border-black/8 hover:bg-white/72 hover:text-slate-900 dark:text-white/52 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04] dark:hover:text-white"
                onClick={() => {
                  router.push(getHref(page - 1))
                }}
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink
              className="rounded-full border border-black/10 bg-white text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/[0.12] dark:bg-white/[0.1] dark:text-white dark:shadow-[0_16px_42px_rgba(0,0,0,0.3)]"
              isActive
              onClick={() => {
                router.push(getHref(page))
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>

          {hasNextPage && (
            <PaginationItem>
              <PaginationLink
                className="rounded-full border border-transparent bg-transparent text-slate-600 transition hover:-translate-y-0.5 hover:border-black/8 hover:bg-white/72 hover:text-slate-900 dark:text-white/52 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04] dark:hover:text-white"
                onClick={() => {
                  router.push(getHref(page + 1))
                }}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {hasExtraNextPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              className="rounded-full border border-black/8 bg-white/72 text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/72 dark:shadow-[0_14px_40px_rgba(0,0,0,0.28)] dark:hover:bg-white/[0.06]"
              disabled={!hasNextPage}
              onClick={() => {
                router.push(getHref(page + 1))
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
