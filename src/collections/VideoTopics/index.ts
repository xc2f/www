import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { adminOrEditor } from '../../access/roles'
import { slugField } from 'payload'

export const VideoTopics: CollectionConfig = {
  slug: 'video-topics',
  access: {
    create: adminOrEditor,
    delete: adminOrEditor,
    read: anyone,
    update: adminOrEditor,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Taxonomy',
    useAsTitle: 'title',
  },
  defaultSort: 'title',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
}
