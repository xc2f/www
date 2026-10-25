import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, getPayload } from 'payload'
import { Mails } from '../../src/collections/Mails'
import { sendEmailTask } from '../../src/tasks/sendEmail'

test('mail queue retries failed sends, stops at the retry limit and skips sent mail', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xc2f-mail-test-'))
  const fields = new Set(['from', 'to', 'subject', 'text', 'html', 'sendStatus', 'result'])
  const payload = await getPayload({
    config: buildConfig({
      secret: 'mail-retry-test-secret',
      db: sqliteAdapter({ client: { url: `file:${path.join(directory, 'test.db')}` } }),
      collections: [
        {
          ...Mails,
          // Keep the actual queue hooks/status fields; attachments/admin components
          // are unrelated to delivery and would require the full application config.
          fields: Mails.fields.filter((field) => 'name' in field && fields.has(field.name)),
        },
      ],
      jobs: { autoRun: [], tasks: [sendEmailTask], deleteJobOnComplete: false },
    }),
  })
  let sends = 0
  let alwaysFail = false
  payload.sendEmail = async () => {
    sends++
    if (sends === 1 || alwaysFail) throw new Error('Temporary provider failure')
    return { messageId: 'test-only-no-email-sent' }
  }

  try {
    const create = () =>
      payload.create({
        collection: 'mails',
        data: {
          from: { address: 'sender@example.com' },
          to: [{ address: 'recipient@example.com' }],
          subject: 'Retry regression',
          sendStatus: 'pending',
          _status: 'published',
        },
      })
    const read = (id: number) => payload.findByID({ collection: 'mails', id })
    const mail = await create()
    await payload.jobs.run({ silent: true })
    assert.equal((await read(mail.id)).sendStatus, 'failed')
    assert.equal(sends, 1)
    await payload.jobs.run({ silent: true })
    assert.equal((await read(mail.id)).sendStatus, 'sent')
    assert.equal(sends, 2)

    const duplicate = await payload.jobs.queue({ task: 'send-email', input: mail })
    await payload.jobs.run({ silent: true })
    assert.equal(sends, 2, 'a sent mail must not be sent again')
    assert.ok(
      (await payload.findByID({ collection: 'payload-jobs', id: duplicate.id })).completedAt,
    )

    alwaysFail = true
    const failing = await create()
    for (let attempt = 0; attempt < 4; attempt++) await payload.jobs.run({ silent: true })
    assert.equal(sends, 5, 'one initial attempt plus two retries')
    assert.equal((await read(failing.id)).sendStatus, 'failed')
    const failedJobs = await payload.find({
      collection: 'payload-jobs',
      where: { hasError: { equals: true } },
    })
    assert.equal(failedJobs.totalDocs, 1)
  } finally {
    await payload.destroy()
    await rm(directory, { recursive: true, force: true })
  }
})
