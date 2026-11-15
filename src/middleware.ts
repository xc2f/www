import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'

import { acceptsMarkdown, isMarkdownPage } from './utilities/markdownNegotiation'

const intlMiddleware = createMiddleware(routing)

export function middleware(req: NextRequest) {
  const response = intlMiddleware(req)
  const { pathname, search } = req.nextUrl
  if (!isMarkdownPage(pathname)) return response

  response.headers.append('Vary', 'Accept')
  if (
    response.headers.has('Location') ||
    (req.method !== 'GET' && req.method !== 'HEAD') ||
    req.headers.has('RSC') ||
    !acceptsMarkdown(req.headers.get('Accept'))
  ) {
    return response
  }

  const target = req.nextUrl.clone()
  target.pathname = '/api/markdown'
  target.search = ''
  target.searchParams.set('page', pathname + search)
  return NextResponse.rewrite(target)
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!admin|api|_next|media|next|trpc|_vercel|.*\\..*).*)',
  ],
}
