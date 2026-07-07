import { CollectionConfig } from 'payload'
import { adminAccess, adminOnly } from '../../access/roles'

import { Code } from '../../blocks/Code/config'

export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: {
    useAsTitle: 'title',
    group: 'Tools',
  },
  defaultSort: '-updatedAt',
  access: {
    admin: adminAccess,
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'blocks',
      admin: {
        initCollapsed: true,
      },
      blocks: [
        {
          slug: 'text',
          fields: [
            {
              name: 'text',
              type: 'textarea',
            },
          ],
        },
        {
          slug: 'json',
          fields: [
            {
              name: 'json',
              type: 'json',
            },
          ],
        },
        Code,
      ],
    },
  ],
  versions: {
    drafts: true,
  },
}
