import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'XC2F'

export function getMediaOpenGraphURL(image?: Media | number | null): string {
  const serverUrl = getServerSideURL()

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    if (ogUrl) return serverUrl + ogUrl
    if (image.url) return serverUrl + image.url
  }

  return `${serverUrl}/og.jpg`
}

export function createVideosMetadata({
  description,
  image,
  title,
  url,
}: {
  description?: string | null
  image?: Media | number | null
  title: string
  url: string
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const ogImage = getMediaOpenGraphURL(image)

  return {
    title,
    description: description || undefined,
    openGraph: mergeOpenGraph({
      description: description || '',
      images: [
        {
          url: ogImage,
        },
      ],
      title: fullTitle,
      url,
    }),
  }
}
