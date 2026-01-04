// src/collections/Mails.ts
import { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'
import { SentMessageInfo } from 'nodemailer'

export const Mails: CollectionConfig = {
  slug: 'mails',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'to', 'status', 'createdAt'],
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    /** From */
    {
      name: 'from',
      type: 'group',
      required: true,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', defaultValue: process.env.EMAIL_DEFAULT_FROM_NAME },
            {
              name: 'address',
              type: 'email',
              required: true,
              defaultValue: process.env.EMAIL_DEFAULT_FROM_HI,
            },
          ],
        },
      ],
    },

    /** To */
    {
      name: 'to',
      type: 'array',
      required: true,
      defaultValue: [
        {
          address: '',
          name: '',
        },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'address',
              type: 'email',
              required: true,
            },
            { name: 'name', type: 'text' },
          ],
        },
      ],
    },

    /** 高级选项开关 */
    {
      name: 'showAdvanced',
      type: 'checkbox',
      label: 'Show advanced options (cc / bcc / reply-to)',
      defaultValue: false,
    },

    /** CC */
    {
      name: 'cc',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData?.showAdvanced,
      },
      defaultValue: [
        {
          address: '',
          name: '',
        },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'address', type: 'email' },
            { name: 'name', type: 'text' },
          ],
        },
      ],
    },

    /** BCC */
    {
      name: 'bcc',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData?.showAdvanced,
      },
      defaultValue: [
        {
          address: '',
          name: '',
        },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'address', type: 'email' },
            { name: 'name', type: 'text' },
          ],
        },
      ],
    },

    /** Reply-To */
    {
      name: 'replyTo',
      type: 'email',
      admin: {
        condition: (_, siblingData) => siblingData?.showAdvanced,
      },
    },

    {
      type: 'ui',
      name: 'divider-advanced',
      admin: {
        components: {
          Field: '@/components/Divider/index.tsx',
        },
      },
    },

    /** Subject */
    {
      name: 'subject',
      type: 'text',
      required: true,
    },

    /** Text body */
    {
      name: 'text',
      type: 'textarea',
      admin: {
        rows: 10,
      },
    },

    /** HTML body（code） */
    {
      name: 'html',
      type: 'code',
      admin: {
        language: 'html',
        description: 'HTML content (takes precedence over text)',
      },
    },

    /** Attachments（media） */
    {
      name: 'attachments',
      type: 'array',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },

    /** Status */
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    /** Result */
    {
      name: 'result',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        if (data.status === 'pending') {
          return data
        }
        // Only update status and result
        return {
          ...originalDoc,
          status: data.status,
          result: data.result,
        }
      },
    ],
    afterChange: [
      async ({ doc, req, collection }) => {
        if (doc.status !== 'pending') {
          return doc
        }
        const { payload } = req
        try {
          ;(await payload.sendEmail(doc)) as SentMessageInfo
          await payload.update({
            req,
            collection: collection.slug,
            id: doc.id,
            data: {
              status: 'sent',
              result: 'ok',
            },
          })
        } catch (err: any) {
          await payload.update({
            req,
            collection: collection.slug,
            id: doc.id,
            data: {
              status: 'failed',
              result: err.message,
            },
          })
        }
      },
    ],
  },
}
