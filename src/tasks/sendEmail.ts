import { randomUUID } from 'node:crypto'
import { hasUncertainOutcome, recordMailAttempt, sendWithTimeout } from '../utilities/mailDelivery'
import type { Mail } from '@/payload-types'
import type { SendEmailOptions, TaskConfig } from 'payload'
import type { Attachment } from 'nodemailer/lib/mailer'

type EmailAddress = Exclude<NonNullable<SendEmailOptions['from']>, string>

type SendEmailTaskConfig = TaskConfig<{
  input: Mail
  output: {
    emailSent: boolean
  }
}>

export const sendEmailTask: SendEmailTaskConfig = {
  slug: 'send-email',
  retries: 2,
  handler: async ({ input, job, req }) => {
    const payload = req.payload
    const mail = await payload.findByID({
      collection: 'mails',
      id: input.id,
      req,
      draft: true,
    })

    const isRetry = mail.sendStatus === 'failed' && (job.totalTried ?? 0) > 0
    if (
      mail._status !== 'published' ||
      mail.deliveryToken !== input.deliveryToken ||
      !mail.deliveryToken ||
      (mail.at && new Date(mail.at).getTime() > Date.now()) ||
      (mail.sendStatus !== 'pending' && !isRetry)
    ) {
      return {
        output: {
          emailSent: false,
        },
      }
    }

    const attemptId = randomUUID()
    const startedAt = new Date().toISOString()
    const attempt = { attemptId, startedAt, jobId: String(job.id) }

    // Conditional update claims this plan once, even when duplicate jobs run together.
    const claimed = await payload.db.updateOne({
      collection: 'mails',
      where: {
        and: [
          { id: { equals: mail.id } },
          { deliveryToken: { equals: mail.deliveryToken } },
          { _status: { equals: 'published' } },
          { sendStatus: { equals: isRetry ? 'failed' : 'pending' } },
        ],
      },
      data: { sendStatus: 'sending', activeAttempt: attemptId, sendStartedAt: startedAt },
      // Adapter-level CAS deliberately bypasses hooks/versions for this lock.
      // Completion/failure is saved through Payload below, including a version.
      options: { atomic: true },
      req,
    })
    if (!claimed) return { output: { emailSent: false } }

    const getAttachments = async (mailDoc: Mail) => {
      const attachments = mailDoc.attachments ?? []
      const attachmentIDs = attachments
        .map((attachment) =>
          typeof attachment.file === 'object' ? attachment.file.id : attachment.file,
        )
        .filter((id): id is number => typeof id === 'number')

      if (!attachments.length) return []
      if (!attachmentIDs.length) throw new Error('附件无效。')

      const mediaDocs = await payload.find({
        collection: 'media',
        where: {
          id: { in: attachmentIDs },
        },
        limit: attachments.length,
        req,
      })

      if (
        attachmentIDs.length !== attachments.length ||
        mediaDocs.docs.length !== new Set(attachmentIDs).size ||
        mediaDocs.docs.some((file) => !file.url)
      ) {
        throw new Error('附件不存在或无法读取，请检查附件后重新发布。')
      }
      const files: Attachment[] = mediaDocs.docs.map((file) => ({
        filename: file.filename ?? undefined,
        path: new URL(file.url!, process.env.NEXT_PUBLIC_SERVER_URL).href,
        contentType: file.mimeType ?? 'application/octet-stream',
      }))

      return files
    }

    const toAddress = (entry: {
      address?: string | null
      name?: string | null
    }): EmailAddress | null => {
      if (!entry.address) {
        return null
      }

      if (entry.name) {
        return {
          name: entry.name,
          address: entry.address,
        }
      }

      return {
        address: entry.address,
      }
    }

    const toAddressList = (
      entries?: { address?: string | null; name?: string | null }[] | null,
    ): EmailAddress[] | undefined => {
      const list = (entries ?? [])
        .map((entry) => toAddress(entry))
        .filter((entry): entry is EmailAddress => entry !== null)

      return list.length > 0 ? list : undefined
    }

    const from = toAddress(mail.from)
    const to = toAddressList(mail.to)

    let acceptedAt: string | undefined
    let messageId: string | undefined
    try {
      await recordMailAttempt(req, mail.id, { ...attempt, outcome: 'sending' })
      if (process.env.ENABLE_EMAIL !== 'true') {
        throw new Error('邮件发送未启用，请检查 ENABLE_EMAIL 和邮件服务配置。')
      }
      const emailOptions: SendEmailOptions = {
        from: from ?? undefined,
        to,
        cc: toAddressList(mail.cc),
        bcc: toAddressList(mail.bcc),
        replyTo: mail.replyTo ?? undefined,
        subject: mail.subject,
        text: mail.text ?? undefined,
        html: mail.html ?? undefined,
        attachments: await getAttachments(mail),
      }

      if (!to?.length || (!mail.text?.trim() && !mail.html?.trim())) {
        throw new Error('收件人或邮件正文为空。')
      }
      const response: unknown = await sendWithTimeout(() => payload.sendEmail(emailOptions))
      acceptedAt = new Date().toISOString()
      if (
        response &&
        typeof response === 'object' &&
        'messageId' in response &&
        typeof response.messageId === 'string'
      ) {
        messageId = response.messageId
      }
      await recordMailAttempt(req, mail.id, {
        ...attempt,
        outcome: 'sent',
        finishedAt: acceptedAt,
        acceptedAt,
        messageId,
      })
      return { output: { emailSent: true } }
    } catch (err) {
      const uncertain = Boolean(acceptedAt) || hasUncertainOutcome(err)
      await recordMailAttempt(req, mail.id, {
        ...attempt,
        outcome: uncertain ? 'uncertain' : 'failed',
        finishedAt: new Date().toISOString(),
        acceptedAt,
        messageId,
        error: `${acceptedAt ? '邮件服务已接收，但保存发送结果失败；请核实，勿直接重发。 ' : ''}${err instanceof Error ? err.message : String(err)}`,
      })
      throw err
    }
  },
}

export default sendEmailTask
