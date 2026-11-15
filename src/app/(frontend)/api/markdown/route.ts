import type { NextRequest } from 'next/server'
import TurndownService from 'turndown'

import { acceptsMarkdown, isMarkdownPage, markdownSourceHeader } from '@/utilities/markdownNegotiation'

const converter = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
converter.remove((node) =>
  node.matches(
    'head, title, script, style, template, noscript, svg, canvas, button, input, select, textarea, [data-site-header], [data-site-footer]',
  ),
)
converter.addRule('homeArchiveDescription', {
  filter: (node) => node.matches('.home-index-link-description'),
  replacement: (content) => ` (${content})`,
})
converter.addRule('postMetadata', {
  filter: (node) => node.matches('.post-meta > :not(:first-child)'),
  replacement: (content) => ` · ${content}`,
})

async function serveMarkdown(request: NextRequest) {
  const headers = new Headers({ Vary: 'Accept', 'Cache-Control': 'private, no-store' })
  const page = request.headers.get(markdownSourceHeader) ?? request.nextUrl.searchParams.get('page')
  if (!page || !acceptsMarkdown(request.headers.get('Accept'))) {
    return new Response(null, { status: 404, headers })
  }

  // Use the local Next server and make an anonymous HTML request to avoid preview data and recursion.
  const origin = `http://127.0.0.1:${process.env.PORT || 3000}`
  const source = URL.parse(page, origin)
  if (!source || source.origin !== origin || !isMarkdownPage(source.pathname)) {
    return new Response(null, { status: 404, headers })
  }

  let upstream: Response
  try {
    upstream = await fetch(source, {
      headers: { Accept: 'text/html' },
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    return new Response(null, { status: 502, headers })
  }

  const location = upstream.headers.get('Location')
  if (upstream.status >= 300 && upstream.status < 400 && location) {
    const redirect = new URL(location, source)
    headers.set(
      'Location',
      redirect.origin === origin ? redirect.pathname + redirect.search + redirect.hash : redirect.href,
    )
    await upstream.body?.cancel()
    return new Response(null, { status: upstream.status, headers })
  }

  const contentType = upstream.headers.get('Content-Type') || ''
  const isHTML = /^text\/html(?:\s*;|$)/i.test(contentType)
  if (isHTML) headers.set('Content-Type', 'text/markdown; charset=utf-8')
  else if (contentType) headers.set('Content-Type', contentType)

  if (request.method === 'HEAD') {
    await upstream.body?.cancel()
    return new Response(null, { status: upstream.status, headers })
  }

  if (!isHTML) return new Response(upstream.body, { status: upstream.status, headers })

  try {
    return new Response(converter.turndown(await upstream.text()) + '\n', {
      status: upstream.status,
      headers,
    })
  } catch {
    return new Response(null, { status: 502, headers })
  }
}

export { serveMarkdown as GET, serveMarkdown as HEAD }
