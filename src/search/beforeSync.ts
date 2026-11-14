import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

type TaxonomyItem = { id: string | number; slug?: string | null; title: string }

const collectTaxonomyItems = async ({
  collection,
  items,
  req,
}: {
  collection: 'categories' | 'tags'
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
  const { categories, heroImage, meta, publishedAt, slug, tags, title } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    heroImage: getRelationID(heroImage),
    publishedAt,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: getRelationID(meta?.image),
      description: meta?.description,
    },
    categories: [],
    tags: [],
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const populatedCategories = await collectTaxonomyItems({
      collection: 'categories',
      items: categories,
      req,
    })

    modifiedDoc.categories = populatedCategories.map((each) => ({
      relationTo: 'categories',
      categoryId: String(each.id),
      title: each.title,
    }))
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    const populatedTags = await collectTaxonomyItems({
      collection: 'tags',
      items: tags,
      req,
    })

    modifiedDoc.tags = populatedTags.map((each) => ({
      tagId: String(each.id),
      title: each.title,
    }))
  }

  return modifiedDoc
}
