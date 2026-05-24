import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { slugField } from 'payload'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

export const Moments: CollectionConfig = {
  slug: 'moments',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultSort: '-publishedAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
    livePreview: {
      url: ({ data: _data, req }) =>
        generatePreviewPath({
          // slug: data?.slug,
          slug: '',
          collection: 'moments',
          req,
        }),
    },
    preview: (_data, { req }) =>
      generatePreviewPath({
        // slug: data?.slug as string,
        slug: '',
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
            { label: '😌 放松', value: 'calm' },
            { label: '🤔 想事情', value: 'thoughtful' },
            { label: '😴 有点累', value: 'tired' },
            { label: '😔 低落', value: 'sad' },
            { label: '⚡️ 状态拉满', value: 'energized' },
            { label: '😎 满足', value: 'content' },
            { label: '🙂 日常', value: 'neutral' },
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
