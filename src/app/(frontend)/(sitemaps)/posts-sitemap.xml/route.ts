import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { routing } from '@/i18n/routing'
import { LOCALE_TO_HREFLANG } from '../config'

const getPostsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const locales = routing.locales

    const results = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    // 使用 flatMap 为每篇文章生成所有语言版本的链接
    const sitemap = results.docs
      ? results.docs
          .filter((post) => Boolean(post?.slug))
          .map((post) => {
            const alternates = locales.map((locale) => ({
              hreflang: LOCALE_TO_HREFLANG[locale],
              href: `${SITE_URL}/${locale}/posts/${post.slug}`,
            }))

            return {
              // 用默认语言作为 loc（通常 en）
              loc: `${SITE_URL}/en/posts/${post.slug}`,
              lastmod: post.updatedAt || dateFallback,
              alternateRefs: [
                ...alternates,
                {
                  hreflang: 'x-default',
                  href: `${SITE_URL}/en/posts/${post.slug}`,
                },
              ],
            }
          })
      : []

    return sitemap
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()
  return getServerSideSitemap(sitemap)
}
