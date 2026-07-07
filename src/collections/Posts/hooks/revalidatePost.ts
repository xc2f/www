import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'
import { getLocalizedPaths, revalidateLocalizedPath } from '../../../utilities/revalidateLocalizedPath'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/posts/${doc.slug}`

      payload.logger.info(`Revalidating post at paths: ${getLocalizedPaths(path).join(', ')}`)

      revalidateLocalizedPath(path)
      revalidateTag('posts-sitemap')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/posts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at paths: ${getLocalizedPaths(oldPath).join(', ')}`)

      revalidateLocalizedPath(oldPath)
      revalidateTag('posts-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc?.slug}`

    revalidateLocalizedPath(path)
    revalidateTag('posts-sitemap')
  }

  return doc
}
