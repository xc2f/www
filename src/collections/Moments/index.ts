import type { CollectionConfig } from 'payload'

import { adminOrEditor } from '../../access/roles'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { slugField } from 'payload'
import { slugify } from 'payload/shared'
import { randomBytes } from 'node:crypto'
import { collectMomentTexts } from '@/utilities/momentTranslation'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

const pad = (value: number) => String(value).padStart(2, '0')

const timestampSlug = (value?: string | Date | null) => {
  const date = value ? new Date(value) : new Date()
  const day = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
  const time = `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`
  return `${day}-${time}`
}

export const Moments: CollectionConfig = {
  slug: 'moments',
  access: {
    create: adminOrEditor,
    delete: adminOrEditor,
    read: authenticatedOrPublished,
    update: adminOrEditor,
  },
  defaultSort: '-publishedAt',
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (!data || operation !== 'create' || slugify(data.slug)) return data

        const base = slugify(data.title) || timestampSlug(data.publishedAt)
        let candidate = base

        for (let attempt = 0; attempt < 3; attempt++) {
          const { totalDocs } = await req.payload.count({
            collection: 'moments',
            where: { slug: { equals: candidate } },
            req,
          })

          if (totalDocs === 0) break
          candidate = `${base}-${randomBytes(3).toString('hex')}`
        }

        data.slug = candidate
        return data
      },
    ],
    afterChange: [
      async ({ context, doc, req }) => {
        if (context.skipTranslation || req.locale === 'en') return doc

        if (!doc.title?.trim() && collectMomentTexts(doc.content).length === 0) {
          return doc
        }

        await req.payload.jobs.queue({
          task: 'translate-moment',
          input: { momentId: doc.id },
          req,
        })

        return doc
      },
    ],
  },
  admin: {
    defaultColumns: ['title', 'publishedAt', '_status'],
    group: 'Content',
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
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: false,
          localized: true,
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
    slugField({
      slugify: ({ data, valueToSlugify }) =>
        slugify(data?.slug) || slugify(valueToSlugify) || timestampSlug(data?.publishedAt),
    }),
  ],
  versions: {
    drafts: true,
  },
}
