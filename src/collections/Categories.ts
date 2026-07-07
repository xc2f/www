import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { adminOrEditor } from '../access/roles'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: adminOrEditor,
    delete: adminOrEditor,
    read: anyone,
    update: adminOrEditor,
  },
  admin: {
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
  ],
}
