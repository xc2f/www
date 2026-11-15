import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'

import { acceptsMarkdown, isMarkdownPage, markdownSourceHeader } from './utilities/markdownNegotiation'

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
  // App Route handlers can receive the original URL instead of the rewrite query.
  const headers = new Headers(req.headers)
  headers.set(markdownSourceHeader, pathname + search)
  return NextResponse.rewrite(target, { request: { headers } })
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!admin|api|_next|media|next|trpc|_vercel|.*\\..*).*)',
  ],
}
