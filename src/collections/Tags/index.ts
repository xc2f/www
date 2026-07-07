import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { adminOrEditor } from '../../access/roles'
import { slugField } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
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
      localized: true,
      required: true,
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
