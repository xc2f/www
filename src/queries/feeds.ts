import 'server-only'
import { getPayloadClient } from './payloadClient'

export async function findFeedBySlug(slug: string) {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'feeds',
    where: {
      slug: { equals: slug },
      enabled: { equals: true },
      _status: { equals: 'published' },
    },
    limit: 1,
  })

  return docs[0] ?? null
}
