import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Collection = keyof Config['collections']

async function getDocument(collection: Collection, slug: string, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const page = await payload.find({
    collection,
    depth,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (collection: Collection, slug: string) =>
  unstable_cache(async () => getDocument(collection, slug), [collection, slug], {
    tags: [`${collection}_${slug}`],
  })

async function getDocumentByID(collection: Collection, id: number | string, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  return payload.findByID({
    collection,
    depth,
    id,
    overrideAccess: false,
  })
}

export const getCachedDocumentByID = (collection: Collection, id: number | string) =>
  unstable_cache(async () => getDocumentByID(collection, id), [collection, String(id)], {
    tags: [`${collection}_${id}`],
  })
