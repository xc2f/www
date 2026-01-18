import type { Block } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const MarkdownBlock: Block = {
  slug: 'markdown',
  interfaceName: 'MarkdownBlock',
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: [],
      }),
      label: false,
      required: true,
    },
  ],
}
