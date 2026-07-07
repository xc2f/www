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
    // Properly type the sendEmail call
    const payload = req.payload
    const log = await payload.findByID({
      collection: 'mails',
      id: input.id,
      req,
    })

    if (log.sendStatus === 'sent') {
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

    const getAttachments = async () => {
      const attachments = input.attachments ?? []
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

    const from = toAddress(input.from)
    const to = toAddressList(input.to)

    try {
      const emailOptions: SendEmailOptions = {
        from: from ?? undefined,
        to,
        cc: toAddressList(input.cc),
        bcc: toAddressList(input.bcc),
        replyTo: input.replyTo ?? undefined,
        subject: input.subject,
        text: input.text ?? undefined,
        html: input.html ?? undefined,
        attachments: await getAttachments(),
      }

      await payload.sendEmail(emailOptions)
      await payload.update({
        collection: 'mails',
        id: input.id,
        data: {
          sendStatus: 'sent',
          result: combineResult('ok'),
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
        id: input.id,
        data: {
          sendStatus: 'failed',
          result: combineResult(err instanceof Error ? err.message : String(err)),
        },
      })
      throw err
    }
  },
}

export default sendEmailTask
