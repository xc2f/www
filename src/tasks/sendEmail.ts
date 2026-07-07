import type { Mail } from '@/payload-types'
import type { SendEmailOptions, TaskConfig } from 'payload'
import type { Address } from 'nodemailer/lib/mailer'
import type { Attachment } from 'nodemailer/lib/mailer'

type SendEmailTaskConfig = TaskConfig<{
  input: Mail
  output: {
    emailSent: boolean
  }
}>

export const sendEmailTask: SendEmailTaskConfig = {
  slug: 'send-email',
  retries: 2,
  handler: async ({ input, req }) => {
    const payload = req.payload
    const mail = await payload.findByID({
      collection: 'mails',
      id: input.id,
      req,
    })

    if (mail.sendStatus !== 'pending') {
      return {
        output: {
          emailSent: false,
        },
      }
    }

    const combineResult = (str: string) => {
      const now = new Date().toISOString()
      return `${now}\n${str}`
    }

    const getAttachments = async (mailDoc: Mail) => {
      const attachments = mailDoc.attachments ?? []
      const attachmentIDs = attachments
        .map((attachment) =>
          typeof attachment.file === 'object' ? attachment.file.id : attachment.file,
        )
        .filter((id): id is number => typeof id === 'number')

      if (!attachmentIDs.length) {
        return []
      }

      const mediaDocs = await payload.find({
        collection: 'media',
        where: {
          id: { in: attachmentIDs },
        },
        limit: attachments.length,
        req,
      })

      const files: Attachment[] = (mediaDocs?.docs || [])
        .filter((file) => file?.url)
        .map((file) => ({
          filename: file.filename ?? undefined,
          path: `${process.env.NEXT_PUBLIC_SERVER_URL}${file.url}`,
          contentType: file.mimeType ?? 'application/octet-stream',
        }))

      return files
    }

    const toAddress = (entry: { address?: string | null; name?: string | null }): Address | null => {
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
      } as Address
    }

    const toAddressList = (
      entries?: { address?: string | null; name?: string | null }[] | null,
    ): Address[] | undefined => {
      const list = (entries ?? [])
        .map((entry) => toAddress(entry))
        .filter((entry): entry is Address => entry !== null)

      return list.length > 0 ? list : undefined
    }

    const from = toAddress(mail.from)
    const to = toAddressList(mail.to)

    try {
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

      await payload.sendEmail(emailOptions)
      await payload.update({
        collection: 'mails',
        id: mail.id,
        data: {
          sendStatus: 'sent',
          result: combineResult('ok'),
        },
        context: {
          skipEmailQueue: true,
        },
        req,
      })
      return {
        output: {
          emailSent: true,
        },
      }
    } catch (err) {
      await req.payload.update({
        collection: 'mails',
        id: mail.id,
        data: {
          sendStatus: 'failed',
          result: combineResult(err instanceof Error ? err.message : String(err)),
        },
        context: {
          skipEmailQueue: true,
        },
        req,
      })
      throw err
    }
  },
}

export default sendEmailTask
