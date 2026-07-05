import { NextResponse } from 'next/server'

import type { Locale } from '@/i18n/types'
import { routing } from '@/i18n/routing'
import { MOMENTS_PAGE_SIZE, queryMomentsPage } from '../queries'

type RouteContext = {
  params: Promise<{
    locale: Locale
  }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const { locale } = await params

  if (!routing.locales.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const parsedPage = Number(searchParams.get('page'))
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const moments = await queryMomentsPage({
    limit: MOMENTS_PAGE_SIZE,
    locale,
    page,
  })

  return NextResponse.json({
    docs: moments.docs,
    hasNextPage: moments.hasNextPage,
    nextPage: moments.nextPage,
  })
}
