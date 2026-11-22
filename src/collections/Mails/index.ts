// src/collections/Mails.ts
import { APIError, type CollectionConfig } from 'payload'
import { randomUUID } from 'node:crypto'
import { resolveMailDelivery } from '../../utilities/mailDelivery'
import { adminAccess, adminOnly, isAdminUser } from '../../access/roles'

export const Mails: CollectionConfig = {
  slug: 'mails',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'to', 'sendStatus', 'createdAt'],
    group: 'Tools',
  },
  defaultSort: '-createdAt',
  endpoints: [
    {
      path: '/:id/resolve-delivery',
      method: 'post',
      handler: async (req) => {
        if (!isAdminUser(req.user)) throw new APIError('无权确认发送结果。', 403)
        const id = Number(req.routeParams?.id)
        if (!Number.isSafeInteger(id) || id <= 0) throw new APIError('邮件编号无效。', 400)
        let body: unknown
        try {
          body = await req.json?.()
        } catch {
          throw new APIError('请求内容无效。', 400)
        }
        if (!body || typeof body !== 'object') throw new APIError('请求内容无效。', 400)
        const { outcome, note, deliveryToken } = body as {
          outcome?: unknown
          note?: unknown
          deliveryToken?: unknown
        }
        await resolveMailDelivery(req, id, outcome, note, deliveryToken)
        return Response.json({ message: '已记录核实结果。' })
      },
    },
  ],
  access: {
    admin: adminAccess,
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
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
              defaultValue: process.env.EMAIL_DEFAULT_FROM,
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
      minRows: 1,
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

    /** Date */
    {
      name: 'at',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: '留空立即发送；修改时间并发布会替换原发送计划。',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'yyyy-MM-dd HH:mm:ss',
        },
      },
    },

    /** sendStatus */
    {
      name: 'sendStatus',
      type: 'select',
      access: { create: () => false, update: () => false },
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Sending', value: 'sending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Needs verification', value: 'uncertain' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: '发布以发送；取消发布或保存为草稿可撤回未发送邮件。失败后重新发布可重试。',
      },
    },

    {
      name: 'deliveryToken',
      type: 'text',
      access: { create: () => false, update: () => false },
      admin: { hidden: true },
    },

    {
      name: 'sendStartedAt',
      type: 'date',
      label: '开始发送时间',
      access: { create: () => false, update: () => false },
      admin: { position: 'sidebar', readOnly: true, hidden: false },
    },
    {
      name: 'sentAt',
      type: 'date',
      label: '服务接收时间',
      access: { create: () => false, update: () => false },
      admin: { position: 'sidebar', readOnly: true, hidden: false },
    },
    {
      name: 'messageId',
      type: 'text',
      label: 'Message ID',
      access: { create: () => false, update: () => false },
      admin: { position: 'sidebar', readOnly: true, hidden: false },
    },
    {
      name: 'activeAttempt',
      type: 'text',
      label: '当前尝试',
      access: { create: () => false, update: () => false },
      admin: { position: 'sidebar', readOnly: true, hidden: true },
    },
    {
      name: 'resolveDelivery',
      type: 'ui',
      admin: { position: 'sidebar', components: { Field: '@/components/MailDeliveryResolution' } },
    },
    {
      name: 'deliveryHistory',
      type: 'array',
      label: '发送记录',
      access: { create: () => false, update: () => false },
      admin: {
        readOnly: true,
        initCollapsed: true,
        description: '每次尝试独立保留。已发送表示邮件服务已接收，不代表收件人已收到。',
      },
      fields: [
        { name: 'attemptId', type: 'text', required: true },
        { name: 'jobId', type: 'text' },
        { name: 'startedAt', type: 'date', required: true },
        { name: 'finishedAt', type: 'date' },
        { name: 'acceptedAt', type: 'date' },
        {
          name: 'outcome',
          type: 'select',
          required: true,
          options: [
            { label: '发送中', value: 'sending' },
            { label: '邮件服务已接收', value: 'sent' },
            { label: '失败', value: 'failed' },
            { label: '待核实', value: 'uncertain' },
          ],
        },
        { name: 'messageId', type: 'text' },
        { name: 'error', type: 'textarea' },
        {
          name: 'resolution',
          type: 'select',
          options: [
            { label: '确认已发送', value: 'sent' },
            { label: '确认未发送', value: 'failed' },
          ],
        },
        { name: 'resolvedAt', type: 'date' },
        { name: 'resolvedBy', type: 'text' },
        { name: 'resolutionNote', type: 'textarea' },
      ],
    },

    /** Result */
    {
      name: 'result',
      type: 'textarea',
      access: { create: () => false, update: () => false },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ context, data, originalDoc, operation, req }) => {
        if (context.skipEmailQueue) return data

        // originalDoc can be a draft; also check the live record before permitting edits.
        const current =
          operation === 'update'
            ? await req.payload.findByID({
                collection: 'mails',
                id: originalDoc.id,
                depth: 0,
                req,
              })
            : undefined
        if (current && ['sent', 'sending', 'uncertain'].includes(current.sendStatus)) {
          throw new APIError('已发送、发送中或待核实的邮件不能修改，请复制后新建邮件。', 409)
        }

        // Every edit invalidates older jobs, including edits saved only as drafts.
        data.deliveryToken = randomUUID()
        data.result = null
        data.activeAttempt = null
        data.sendStartedAt = null
        data.sentAt = null
        data.messageId = null
        // Copying a mail starts fresh; editing/retrying preserves earlier attempts.
        data.deliveryHistory = current?.deliveryHistory ?? []
        const isPublished = (data._status ?? originalDoc?._status ?? 'draft') === 'published'
        if (current) {
          // Draft saves normally touch only versions. Invalidate the live plan in
          // this transaction too, so a worker cannot claim it after a draft edit.
          const invalidated = await req.payload.db.updateOne({
            collection: 'mails',
            where: {
              and: [
                { id: { equals: current.id } },
                { sendStatus: { in: ['pending', 'failed', 'cancelled'] } },
              ],
            },
            data: {
              deliveryToken: data.deliveryToken,
              sendStatus: isPublished ? 'pending' : 'cancelled',
            },
            options: { atomic: true },
            req,
          })
          if (!invalidated) throw new APIError('邮件已开始发送，请刷新后查看状态。', 409)
        }
        if (!isPublished) {
          data.sendStatus =
            originalDoc?._status === 'published' || originalDoc?.sendStatus === 'cancelled'
              ? 'cancelled'
              : 'pending'
          return data
        }

        const mail = { ...originalDoc, ...data }
        if (!mail.to?.some((entry: { address?: string }) => entry.address?.trim())) {
          throw new APIError('请填写至少一位收件人。', 400)
        }
        if (!mail.text?.trim() && !mail.html?.trim()) {
          throw new APIError('请填写邮件正文。', 400)
        }
        if (mail.at && !Number.isFinite(new Date(mail.at).getTime())) {
          throw new APIError('发送时间无效。', 400)
        }
        data.sendStatus = 'pending'
        return data
      },
    ],
    afterChange: [
      async ({ context, doc, req }) => {
        if (context.skipEmailQueue) {
          return doc
        }

        const { sendStatus, _status } = doc
        if (sendStatus !== 'pending' || _status === 'draft') {
          return doc
        }

        await req.payload.jobs.queue({
          task: 'send-email',
          req,
          input: doc,
          waitUntil: doc.at ? new Date(doc.at) : undefined,
        })
      },
    ],
  },
  versions: {
    drafts: true,
  },
}
