import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { slugField } from 'payload'

export const Feeds: CollectionConfig = {
  slug: 'feeds',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'feedUrl', 'enabled', '_status', 'updatedAt'],
    group: 'Tools',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'feedUrl',
      type: 'text',
      label: 'Feed URL',
      admin: {
        readOnly: true,
        description: `自动生成，格式为 ${process.env.NEXT_PUBLIC_SERVER_URL}/api/feeds/for/{slug}`,
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'json',
      type: 'json',
    },
    {
      name: 'body',
      type: 'textarea',
      admin: {
        rows: 20,
      },
    },
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.slug) {
          data.feedUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/feeds/for/${data.slug}${data.json ? '?json' : ''}`
        }
        return data
      },
    ],
  },
  endpoints: [
    {
      path: '/for/:slug',
      method: 'get',
      handler: async (req) => {
        const slug = typeof req.routeParams?.slug === 'string' ? req.routeParams.slug : undefined

        if (!slug) {
          return Response.json({ message: 'Slug is required' }, { status: 400 })
        }

        const { json } = req.query
        const payload = req.payload

        const result = await payload.find({
          collection: 'feeds',
          where: {
            slug: { equals: slug },
            enabled: { equals: true },
            _status: { equals: 'published' },
          },
          limit: 1,
        })

        if (!result.docs.length) {
          return Response.json({ message: 'Feed not found' }, { status: 404 })
        }

        const feed = result.docs[0]
        if (json !== undefined) {
          return Response.json(feed.json ?? {}, { status: 200 })
        }
        return new Response(feed.body ?? '', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      },
    },
  ],
  versions: {
    drafts: true,
  },
}
