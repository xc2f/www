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

    const locales = routing.locales
    const defaultLocale = 'en'
    const dateFallback = new Date().toISOString()

    // 1️⃣ 默认页面（search / posts）
    const defaultPages = ['search', 'posts']

    const defaultSitemap = defaultPages.map((slug) => {
      const alternates = locales.map((locale) => ({
        hreflang: LOCALE_TO_HREFLANG[locale],
        href: `${SITE_URL}/${locale}/${slug}`,
      }))

      return {
        loc: `${SITE_URL}/${defaultLocale}/${slug}`,
        lastmod: dateFallback,
        alternateRefs: [
          ...alternates,
          {
            hreflang: 'x-default',
            href: `${SITE_URL}/${defaultLocale}/${slug}`,
          },
        ],
      }
    })

    // 2️⃣ Payload pages
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

    const pageSitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .map((page) => {
            const isHome = page.slug === 'home'

            const alternates = locales.map((locale) => ({
              hreflang: LOCALE_TO_HREFLANG[locale],
              href: isHome ? `${SITE_URL}/${locale}` : `${SITE_URL}/${locale}/${page.slug}`,
            }))

            return {
              loc: isHome
                ? `${SITE_URL}/${defaultLocale}`
                : `${SITE_URL}/${defaultLocale}/${page.slug}`,
              lastmod: page.updatedAt || dateFallback,
              alternateRefs: [
                ...alternates,
                {
                  hreflang: 'x-default',
                  href: isHome
                    ? `${SITE_URL}/${defaultLocale}`
                    : `${SITE_URL}/${defaultLocale}/${page.slug}`,
                },
              ],
            }
          })
      : []

    return [...defaultSitemap, ...pageSitemap]
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
