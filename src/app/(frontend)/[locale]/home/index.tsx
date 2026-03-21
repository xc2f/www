import type { RequiredDataFromCollectionSlug } from 'payload'

import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'

import { HomePageClient } from './HomePageClient'
import { JourneyHome } from './JourneyHome.client'

type HomePageProps = {
  draft: boolean
  page: RequiredDataFromCollectionSlug<'pages'>
  url: string
}

export function HomePage({ draft, page, url }: HomePageProps) {
  void page

  return (
    <main className="bg-[#02050b] pt-16 pb-24">
      <HomePageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <JourneyHome />
    </main>
  )
}
