import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { adminOrEditor } from '../../access/roles'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { ChartBlock } from '../../blocks/ChartBlock/config'
import { MarkdownBlock } from '../../blocks/MarkdownBlock/config'
import { slugField } from 'payload'

export const Videos: CollectionConfig = {
  slug: 'videos',
  access: {
    create: adminOrEditor,
    delete: adminOrEditor,
    read: authenticatedOrPublished,
    update: adminOrEditor,
  },
  admin: {
    defaultColumns: ['title', 'topic', 'publishedAt', '_status'],
    group: 'Content',
    useAsTitle: 'title',
  },
  defaultSort: '-publishedAt',
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
      name: 'topic',
      type: 'relationship',
      relationTo: 'video-topics',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'originalTitle',
      type: 'text',
    },
    {
      name: 'originalAuthor',
      type: 'text',
    },
    {
      name: 'originalUrl',
      type: 'text',
      label: 'Original URL',
      admin: {
        description: 'Original video or source URL.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video URL',
      admin: {
        description: 'Primary watch URL for the XC2F archive page. Keep this platform-neutral.',
      },
    },
    {
      name: 'embedUrl',
      type: 'text',
      label: 'Embed URL',
      admin: {
        description: 'Store only the iframe src URL, not the complete iframe HTML.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'originalPublishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short description for lists, SEO, Open Graph, and sharing.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            BlocksFeature({
              blocks: [MediaBlock, Code, MarkdownBlock, Banner, ChartBlock],
            }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ]
        },
      }),
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  versions: {
    drafts: true,
  },
}
