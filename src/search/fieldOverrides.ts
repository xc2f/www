import { Field } from 'payload'

export const searchFields: Field[] = [
  {
    name: 'slug',
    type: 'text',
    index: true,
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'meta',
    label: 'Meta',
    type: 'group',
    index: true,
    admin: {
      readOnly: true,
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
      },
      {
        type: 'text',
        name: 'description',
        label: 'Description',
      },
      {
        name: 'image',
        label: 'Image',
        type: 'upload',
        relationTo: 'media',
      },
    ],
  },
  {
    name: 'heroImage',
    type: 'upload',
    relationTo: 'media',
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'publishedAt',
    type: 'date',
    admin: {
      readOnly: true,
    },
  },
  {
    label: 'Categories',
    name: 'categories',
    type: 'array',
    admin: {
      readOnly: true,
    },
    fields: [
      {
        name: 'relationTo',
        type: 'text',
      },
      {
        name: 'categoryID',
        type: 'text',
      },
      {
        name: 'title',
        type: 'text',
      },
    ],
  },
  {
    name: 'summary',
    type: 'textarea',
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'originalTitle',
    type: 'text',
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'originalAuthor',
    type: 'text',
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'cover',
    type: 'upload',
    relationTo: 'media',
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'topic',
    type: 'group',
    admin: {
      readOnly: true,
    },
    fields: [
      {
        name: 'topicID',
        type: 'text',
      },
      {
        name: 'slug',
        type: 'text',
      },
      {
        name: 'title',
        type: 'text',
      },
    ],
  },
  {
    label: 'Tags',
    name: 'tags',
    type: 'array',
    admin: {
      readOnly: true,
    },
    fields: [
      {
        name: 'tagID',
        type: 'text',
      },
      {
        name: 'title',
        type: 'text',
      },
    ],
  },
]
