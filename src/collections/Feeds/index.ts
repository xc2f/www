import { slugField, type CollectionConfig } from 'payload'

import { adminOrEditor } from '../../access/roles'
import { getServerSideURL } from '../../utilities/getURL'
import { feedEndpoints } from './endpoints'

export const Feeds: CollectionConfig = {
  slug: 'feeds',
  access: {
    create: adminOrEditor,
    delete: adminOrEditor,
    read: (args) =>
      adminOrEditor(args) || {
        _status: { equals: 'published' },
        visibility: { equals: 'public' },
      },
    readVersions: adminOrEditor,
    update: adminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'feedUrl', 'visibility', '_status', 'updatedAt'],
    group: 'Tools',
  },
  defaultSort: '-updatedAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'public',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
      ],
    },
    {
      name: 'privateSubscription',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '/collections/Feeds/SubscriptionLink#SubscriptionLink' },
      },
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
      ({ data, originalDoc }) => {
        if (!data) return data
        const visibility = data.visibility ?? originalDoc?.visibility
        const slug = data.slug ?? originalDoc?.slug
        const json = 'json' in data ? data.json : originalDoc?.json

        if (visibility === 'private') {
          data.feedUrl = null
        } else if (slug) {
          data.feedUrl = `${getServerSideURL()}/api/feeds/for/${encodeURIComponent(slug)}${json != null ? '?json' : ''}`
        }
        return data
      },
    ],
  },
  endpoints: feedEndpoints,
  versions: {
    drafts: true,
  },
}
