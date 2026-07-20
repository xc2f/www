import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { DetailRichText } from '@/components/DetailPage/DetailRichText'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

import { Locale } from '@/i18n/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'

type Args = {
  params: Promise<{
    slug?: string
    locale: Locale
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '', locale } = await paramsPromise

  // Enable static rendering
  setRequestLocale(locale)
  const t = await getTranslations('Posts')

  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  if (!post) return <PayloadRedirects url={url} />

  const relatedPosts = post.relatedPosts?.filter((post) => typeof post === 'object') ?? []

  return (
    <article className="relative overflow-hidden bg-background pb-20">
      <div className="pointer-events-none absolute left-[-14rem] top-[36rem] h-[28rem] w-[28rem] rounded-full bg-[#ff8f72]/[0.03] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-12rem] top-[48rem] h-[30rem] w-[30rem] rounded-full bg-[#7dd7ff]/[0.028] blur-[140px]" />
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="relative z-20 -mt-4 pt-0 sm:-mt-8">
        <div className="container">
          <div className="relative mx-auto max-w-[58rem]">
            <DetailRichText data={post.content} />
          </div>

          {relatedPosts.length > 0 && (
            <section className="mx-auto mt-16 max-w-[58rem] sm:mt-20">
              <div className="mb-8 flex items-center gap-4 text-muted-foreground dark:text-white/42">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/[0.08]" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.24em]">
                  More
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/[0.08]" />
              </div>

              <RelatedPosts
                className="max-w-none lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                docs={relatedPosts}
              />
            </section>
          )}

          {post.githubDiscussionUrl && (
            <div className="mx-auto mt-16 max-w-[46rem] sm:mt-20">
              <div className="mb-5 flex items-center gap-4 text-muted-foreground dark:text-white/36">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/[0.08]" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.24em]">
                  {t('discussion')}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/[0.08]" />
              </div>
              <div className="relative overflow-hidden rounded-[1.2rem] border border-black/[0.045] bg-white/54 px-5 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)] backdrop-blur-[6px] dark:border-white/[0.05] dark:bg-[linear-gradient(180deg,rgba(8,13,18,0.58),rgba(6,10,15,0.72))] dark:shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/[0.08]" />
                <div className="pointer-events-none absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-[#7dd7ff]/40 to-transparent" />
                <a
                  href={post.githubDiscussionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-black/[0.025] text-[1rem] text-foreground/72 transition-colors group-hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/68 dark:group-hover:text-white">
                      ↗
                    </span>
                    <span className="block">
                      <span className="block text-base text-foreground/84 transition-colors group-hover:text-foreground dark:text-white/76 dark:group-hover:text-white">
                        {t('join_the_discussion_on_github')}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground dark:text-white/42">
                        {t('discussion_description')}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-3 pl-[3.75rem] sm:pl-0">
                    <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-foreground/70 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground dark:text-white/58 dark:group-hover:text-white/82">
                      {t('open_on_github')}
                    </span>
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '', locale } = await paramsPromise
  setRequestLocale(locale)
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
