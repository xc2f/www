import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { slugField } from 'payload'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

export const Moments: CollectionConfig = {
  slug: 'moments',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'published'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'moments',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'moments',
        req,
      }),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: false,
        },
        {
          name: 'mood',
          label: '心情',
          type: 'select',
          defaultValue: 'neutral',
          options: [
            { label: '😊 开心', value: 'happy' },
            { label: '😌 平静', value: 'calm' },
            { label: '🤔 思考', value: 'thoughtful' },
            { label: '😴 疲惫', value: 'tired' },
            { label: '😢 低落', value: 'sad' },
            { label: '🔥 充实', value: 'energized' },
            { label: '😎 满足', value: 'content' },
            { label: '😐 无感', value: 'neutral' },
          ],
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    slugField(),
  ],
  versions: {
    drafts: true,
  },
}
