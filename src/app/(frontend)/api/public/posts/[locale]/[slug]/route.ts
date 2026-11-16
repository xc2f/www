import config from '@payload-config'
import { getPayload } from 'payload'

import { routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/types'
import { getServerSideURL } from '@/utilities/getURL'

type Taxonomy = { slug: string; title: string }

function publicTerms(terms?: (number | Taxonomy)[] | null) {
  return (terms ?? []).flatMap((term) =>
    term && typeof term === 'object' ? [{ slug: term.slug, title: term.title }] : [],
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  if (!routing.locales.some((supported) => supported === locale)) {
    return Response.json({ error: 'Unsupported locale' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const { docs: [post] } = await payload.find({
    collection: 'posts',
    draft: false,
    overrideAccess: false,
    locale: locale as Locale,
    depth: 1,
    limit: 1,
    pagination: false,
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    select: {
      slug: true,
      title: true,
      meta: { description: true },
      authors: true,
      populatedAuthors: true,
      categories: true,
      tags: true,
      publishedAt: true,
      updatedAt: true,
    },
  })

  if (!post) return Response.json({ error: 'Post not found' }, { status: 404 })

  return Response.json({
    locale,
    slug: post.slug,
    title: post.title,
    description: post.meta?.description ?? null,
    authors: (post.populatedAuthors ?? []).flatMap(({ name }) => (name ? [name] : [])),
    publishedAt: post.publishedAt ?? null,
    updatedAt: post.updatedAt,
    categories: publicTerms(post.categories),
    tags: publicTerms(post.tags),
    canonicalUrl: new URL(
      `/${locale}/posts/${encodeURIComponent(post.slug)}`,
      getServerSideURL(),
    ).href,
  })
}
