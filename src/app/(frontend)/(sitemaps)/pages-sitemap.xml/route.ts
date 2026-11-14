import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { routing } from '@/i18n/routing'
import { LOCALE_TO_HREFLANG } from '../config'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })

    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'https://example.com')

    const { locales, defaultLocale } = routing
    const fixedPages = new Map<string, string>([
      ['home', ''],
      ['moments', '/moments'],
      ['posts', '/posts'],
      ['projects', '/projects'],
      ['search', '/search'],
    ])

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: { equals: 'published' },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const pages = [
      ...Array.from(fixedPages.values(), (path) => ({ path, lastmod: undefined })),
      ...results.docs.flatMap(({ slug, updatedAt }) =>
        slug && !fixedPages.has(slug) ? [{ path: `/${slug}`, lastmod: updatedAt }] : [],
      ),
    ]

    return pages.map(({ path, lastmod }) => {
      const loc = `${SITE_URL}/${defaultLocale}${path}`

      return {
        loc,
        ...(lastmod ? { lastmod } : {}),
        alternateRefs: [
          ...locales.map((locale) => ({
            hreflang: LOCALE_TO_HREFLANG[locale],
            href: `${SITE_URL}/${locale}${path}`,
          })),
          { hreflang: 'x-default', href: loc },
        ],
      }
    })
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()
  return getServerSideSitemap(sitemap)
}
