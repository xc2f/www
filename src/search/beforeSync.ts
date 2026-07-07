import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

type TaxonomyItem = { id: string | number; slug?: string | null; title: string }

const collectTaxonomyItems = async ({
  collection,
  items,
  req,
}: {
  collection: 'categories' | 'tags' | 'video-topics'
  items: unknown[]
  req: Parameters<BeforeSync>[0]['req']
}): Promise<TaxonomyItem[]> => {
  const populatedItems: TaxonomyItem[] = []
  const missingIDs: (number | string)[] = []

  for (const item of items) {
    if (!item) {
      continue
    }

    if (typeof item === 'object' && 'id' in item && 'title' in item) {
      const taxonomyItem = item as TaxonomyItem
      populatedItems.push(taxonomyItem)
      continue
    }

    if (typeof item === 'number' || typeof item === 'string') {
      missingIDs.push(item)
    }
  }

  if (missingIDs.length === 0) {
    return populatedItems
  }

  const fetchedItems = await req.payload.find({
    collection,
    depth: 0,
    limit: missingIDs.length,
    pagination: false,
    req,
    select: {
      slug: true,
      title: true,
    },
    where: {
      id: {
        in: [...new Set(missingIDs)],
      },
    },
  })
  const fetchedItemMap = new Map(fetchedItems.docs.map((doc) => [String(doc.id), doc]))

  for (const item of items) {
    if (typeof item !== 'number' && typeof item !== 'string') {
      continue
    }

    const fetchedItem = fetchedItemMap.get(String(item))
    if (fetchedItem) {
      populatedItems.push({
        id: fetchedItem.id,
        slug: 'slug' in fetchedItem ? fetchedItem.slug : undefined,
        title: fetchedItem.title,
      })
    }
  }

  return populatedItems
}

const collectTaxonomyItem = async ({
  collection,
  item,
  req,
}: {
  collection: 'video-topics'
  item: unknown
  req: Parameters<BeforeSync>[0]['req']
}): Promise<TaxonomyItem | null> => {
  const [taxonomyItem] = await collectTaxonomyItems({
    collection,
    items: item ? [item] : [],
    req,
  })

  return taxonomyItem ?? null
}

const getRelationID = (value: unknown): string | number | null | undefined => {
  if (!value || typeof value !== 'object') {
    return value as string | number | null | undefined
  }

  if ('id' in value) {
    return (value as { id?: string | number | null }).id
  }

  return undefined
}

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const {
    categories,
    cover,
    heroImage,
    meta,
    originalAuthor,
    originalTitle,
    publishedAt,
    slug,
    summary,
    tags,
    title,
    topic,
  } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    cover: getRelationID(cover),
    heroImage: getRelationID(heroImage),
    originalAuthor,
    originalTitle,
    publishedAt,
    summary,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: getRelationID(meta?.image),
      description: meta?.description,
    },
    categories: [],
    tags: [],
    topic: undefined,
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const populatedCategories = await collectTaxonomyItems({
      collection: 'categories',
      items: categories,
      req,
    })

    modifiedDoc.categories = populatedCategories.map((each) => ({
      relationTo: 'categories',
      categoryID: String(each.id),
      title: each.title,
    }))
  }

  if (collection === 'videos' && topic) {
    const populatedTopic = await collectTaxonomyItem({
      collection: 'video-topics',
      item: topic,
      req,
    })

    if (populatedTopic) {
      modifiedDoc.topic = {
        topicID: String(populatedTopic.id),
        slug: populatedTopic.slug,
        title: populatedTopic.title,
      }
    }
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    const populatedTags = await collectTaxonomyItems({
      collection: 'tags',
      items: tags,
      req,
    })

    modifiedDoc.tags = populatedTags.map((each) => ({
      tagID: String(each.id),
      title: each.title,
    }))
  }

  return modifiedDoc
}
