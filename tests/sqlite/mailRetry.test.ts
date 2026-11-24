import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, createLocalReq, getPayload } from 'payload'
import { Users } from '../../src/collections/Users'
import {
  MailDeliveryTimeout,
  recordMailAttempt,
  recoverMailDeliveries,
  resolveMailDelivery,
  sendWithTimeout,
} from '../../src/utilities/mailDelivery'
import { Mails } from '../../src/collections/Mails'
import { serializeSqliteJobs } from '../../src/utilities/serializeSqliteJobs'
import { sendEmailTask } from '../../src/tasks/sendEmail'

test('mail plans handle retries, cancellation, rescheduling, duplicates and uncertain results', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xc2f-mail-test-'))
  const fields = new Set([
    'from',
    'to',
    'subject',
    'text',
    'html',
    'sendStatus',
    'result',
    'deliveryToken',
    'at',
    'activeAttempt',
    'sendStartedAt',
    'sentAt',
    'messageId',
    'deliveryHistory',
  ])
  const payload = await getPayload({
    config: buildConfig({
      secret: 'mail-retry-test-secret',
      onInit: serializeSqliteJobs,
      db: sqliteAdapter({
        client: { url: `file:${path.join(directory, 'test.db')}` },
        transactionOptions: { behavior: 'immediate' },
      }),
      collections: [
        Users,
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
  const previousEnableEmail = process.env.ENABLE_EMAIL
  process.env.ENABLE_EMAIL = 'true'
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
          text: 'Test message',
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
    const sent = await read(mail.id)
    assert.equal(sent.deliveryHistory?.length, 2)
    assert.equal(sent.deliveryHistory?.[0].outcome, 'failed')
    assert.equal(sent.deliveryHistory?.[1].outcome, 'sent')
    assert.equal(sent.messageId, 'test-only-no-email-sent')
    assert.ok(sent.sentAt)
    assert.ok(sent.deliveryHistory?.[0].finishedAt)

    const duplicate = await payload.jobs.queue({ task: 'send-email', input: mail })
    await payload.jobs.run({ silent: true })
    assert.equal(sends, 2, 'a sent mail must not be sent again')
    assert.ok(
      (await payload.findByID({ collection: 'payload-jobs', id: duplicate.id })).completedAt,
    )

    const cancelled = await create()
    await payload.update({ collection: 'mails', id: cancelled.id, data: { _status: 'draft' } })
    await payload.jobs.run({ silent: true })
    assert.equal(sends, 2, 'unpublishing must cancel queued delivery')
    assert.equal((await read(cancelled.id)).sendStatus, 'cancelled')

    const raced = await create()
    const originalDbUpdate = payload.db.updateOne
    let withdrawBeforeClaim = true
    payload.db.updateOne = new Proxy(originalDbUpdate, {
      async apply(target, thisArg, args) {
        if (
          withdrawBeforeClaim &&
          args[0]?.collection === 'mails' &&
          args[0]?.data?.sendStatus === 'sending'
        ) {
          withdrawBeforeClaim = false
          await payload.update({
            collection: 'mails',
            id: raced.id,
            data: { _status: 'draft' },
            draft: true,
          })
        }
        return Reflect.apply(target, thisArg, args)
      },
    })
    try {
      await payload.jobs.run({ silent: true })
      assert.equal(sends, 2, 'a draft saved between reading and claiming must cancel delivery')
    } finally {
      payload.db.updateOne = originalDbUpdate
    }

    const revised = await create()
    await payload.update({
      collection: 'mails',
      id: revised.id,
      data: { text: 'Unpublished edit', _status: 'draft' },
      draft: true,
    })
    await payload.jobs.run({ silent: true })
    assert.equal(sends, 2, 'saving a draft invalidates the published plan')

    const scheduled = await create()
    await payload.update({
      collection: 'mails',
      id: scheduled.id,
      data: { at: new Date(Date.now() + 3600000).toISOString(), _status: 'published' },
    })
    await payload.jobs.run({ silent: true })
    assert.equal(sends, 2, 'an obsolete job must not send a rescheduled mail early')
    await payload.update({
      collection: 'mails',
      id: scheduled.id,
      data: { at: null, _status: 'published' },
    })
    await payload.jobs.run({ silent: true })
    assert.equal(sends, 3, 'the replacement plan sends once')
    await assert.rejects(
      payload.update({
        collection: 'mails',
        id: scheduled.id,
        data: { subject: 'Changed after send' },
      }),
    )

    const concurrent = await create()
    const concurrentJob = await payload.jobs.queue({ task: 'send-email', input: concurrent })
    const handler = sendEmailTask.handler
    assert.equal(typeof handler, 'function')
    if (typeof handler !== 'function') throw new Error('Expected a task handler')
    const unexpectedTask = async () => {
      throw new Error('Unexpected subtask')
    }
    const invoke = async () =>
      handler({
        input: concurrent,
        job: {
          ...concurrentJob,
          input: '',
          taskStatus: {
            'send-email': {},
            'translate-moment': {},
            backupDatabase: {},
            schedulePublish: {},
            inline: {},
          },
        },
        req: await createLocalReq({}, payload),
        tasks: {
          'send-email': unexpectedTask,
          'translate-moment': unexpectedTask,
          backupDatabase: unexpectedTask,
          schedulePublish: unexpectedTask,
          inline: unexpectedTask,
        },
        inlineTask: unexpectedTask,
      })
    await Promise.all([invoke(), invoke()])
    // Overlapping cron/manual runs are serialized, including job completion writes.
    await Promise.all([
      payload.jobs.run({ silent: true, sequential: false }),
      payload.jobs.run({ silent: true }),
    ])
    assert.equal(sends, 4, 'concurrent jobs must claim a plan only once')
    assert.equal((await read(concurrent.id)).sendStatus, 'sent')

    const uncertain = await create()
    const originalUpdate = payload.update
    let failResultWrite = true
    payload.update = new Proxy(originalUpdate, {
      apply(target, thisArg, args) {
        if (failResultWrite && args[0]?.data?.sendStatus === 'sent') {
          failResultWrite = false
          throw new Error('Simulated result write failure')
        }
        return Reflect.apply(target, thisArg, args)
      },
    })
    try {
      await payload.jobs.run({ silent: true })
      assert.equal((await read(uncertain.id)).sendStatus, 'uncertain')
      await payload.jobs.run({ silent: true })
      assert.equal(sends, 5, 'accepted mail must not resend after a result write failure')
    } finally {
      payload.update = originalUpdate
    }

    alwaysFail = true
    const failing = await create()
    for (let attempt = 0; attempt < 4; attempt++) await payload.jobs.run({ silent: true })
    assert.equal(sends, 8, 'one initial attempt plus two retries')
    assert.equal((await read(failing.id)).sendStatus, 'failed')
    const failedJobs = await payload.find({
      collection: 'payload-jobs',
      where: { hasError: { equals: true } },
    })
    assert.equal(failedJobs.totalDocs, 1)

    const admin = await payload.create({
      collection: 'users',
      data: {
        email: 'mail-admin@example.com',
        password: 'test-only-password',
        roles: ['admin'],
      },
    })
    const editor = await payload.create({
      collection: 'users',
      data: {
        email: 'mail-editor@example.com',
        password: 'test-only-password',
        roles: ['editor'],
      },
    })
    const adminReq = () => createLocalReq({ user: { ...admin, collection: 'users' } }, payload)
    const resolve = async (
      ...args: [Parameters<typeof resolveMailDelivery>[0], number, unknown, unknown]
    ) => resolveMailDelivery(...args, (await read(args[1])).deliveryToken ?? null)
    const interrupted = await create()
    const fresh = await create()
    await payload.db.updateOne({
      collection: 'mails',
      id: fresh.id,
      data: {
        sendStatus: 'sending',
        sendStartedAt: new Date().toISOString(),
        activeAttempt: 'fresh-attempt',
      },
    })
    await recoverMailDeliveries(payload)
    assert.equal(
      (await read(fresh.id)).sendStatus,
      'sending',
      'a current send must not be recovered as interrupted',
    )
    const oldStart = new Date(Date.now() - 30 * 60000).toISOString()
    await payload.db.updateOne({
      collection: 'mails',
      id: interrupted.id,
      data: {
        sendStatus: 'sending',
        sendStartedAt: oldStart,
        activeAttempt: null,
      },
    })
    const interruptedJob = await payload.jobs.queue({ task: 'send-email', input: interrupted })
    await payload.db.updateOne({
      collection: 'payload-jobs',
      id: interruptedJob.id,
      data: {
        processing: true,
        updatedAt: oldStart,
      },
    })
    await recoverMailDeliveries(payload)
    assert.equal(
      (await payload.findByID({ collection: 'payload-jobs', id: interruptedJob.id })).processing,
      false,
    )
    const recovered = await read(interrupted.id)
    assert.equal(recovered.sendStatus, 'uncertain', 'interrupted sends need manual verification')
    assert.equal(recovered.deliveryHistory?.length, 1)
    await recoverMailDeliveries(payload)
    assert.equal((await read(interrupted.id)).deliveryHistory?.length, 1, 'recovery is idempotent')
    await assert.rejects(
      resolve(await createLocalReq({}, payload), interrupted.id, 'failed', 'Checked provider'),
      /无权/,
    )
    await assert.rejects(
      resolve(
        await createLocalReq({ user: { ...editor, collection: 'users' } }, payload),
        interrupted.id,
        'failed',
        'Checked provider',
      ),
      /无权/,
    )
    await assert.rejects(resolve(await adminReq(), interrupted.id, 'failed', ''), /核实说明/)
    const sendsBeforeResolution = sends
    const resolved = await resolve(await adminReq(), interrupted.id, 'failed', '服务端无发送记录。')
    assert.equal(resolved.sendStatus, 'failed')
    assert.equal(resolved.deliveryHistory?.[0].outcome, 'uncertain')
    assert.equal(resolved.deliveryHistory?.[0].resolution, 'failed')
    assert.equal(resolved.deliveryHistory?.[0].resolvedBy, String(admin.id))
    await assert.rejects(
      resolve(await adminReq(), interrupted.id, 'sent', '重复确认'),
      /只有待核实/,
    )
    await payload.jobs.run({ silent: true })
    assert.equal(
      sends,
      sendsBeforeResolution,
      'manual failure confirmation must not retry an older job',
    )
    alwaysFail = false
    await payload.update({
      collection: 'mails',
      id: interrupted.id,
      data: { _status: 'published', text: 'Explicit retry' },
    })
    await recordMailAttempt(await createLocalReq({}, payload), interrupted.id, {
      attemptId: recovered.activeAttempt!,
      startedAt: oldStart,
      outcome: 'sent',
      messageId: 'late-response',
    })
    assert.equal(
      (await read(interrupted.id)).sendStatus,
      'pending',
      'late results must not change the replacement plan',
    )
    await payload.jobs.run({ silent: true })
    const retried = await read(interrupted.id)
    assert.equal(retried.sendStatus, 'sent')
    assert.equal(retried.deliveryHistory?.length, 2)
    assert.equal(retried.deliveryHistory?.[0].resolutionNote, '服务端无发送记录。')

    const timeoutMail = await create()
    const provider = payload.sendEmail
    payload.sendEmail = async () => {
      throw new MailDeliveryTimeout()
    }
    await payload.jobs.run({ silent: true })
    assert.equal((await read(timeoutMail.id)).sendStatus, 'uncertain')
    await payload.jobs.run({ silent: true })
    payload.sendEmail = provider
    await assert.rejects(
      resolveMailDelivery(await adminReq(), timeoutMail.id, 'sent', '核实旧计划。', 'old-plan'),
      /计划已更新/,
    )
    const confirmedSent = await resolve(
      await adminReq(),
      timeoutMail.id,
      'sent',
      '收件人确认已收到。',
    )
    assert.equal(confirmedSent.sendStatus, 'sent')
    assert.equal(confirmedSent.deliveryHistory?.[0].resolution, 'sent')
    await assert.rejects(
      sendWithTimeout(() => new Promise(() => {}), 5),
      MailDeliveryTimeout,
    )

    await recoverMailDeliveries(payload, Date.now() + 16 * 60000)
    assert.equal(
      (await read(fresh.id)).sendStatus,
      'uncertain',
      'a live-process send older than fifteen minutes needs verification',
    )
    const sendsBeforeDisabled = sends
    const disabled = await create()
    process.env.ENABLE_EMAIL = 'false'
    await payload.jobs.run({ silent: true })
    assert.equal(sends, sendsBeforeDisabled, 'disabled email must not call the provider')
    assert.equal((await read(disabled.id)).sendStatus, 'failed')
  } finally {
    if (previousEnableEmail === undefined) delete process.env.ENABLE_EMAIL
    else process.env.ENABLE_EMAIL = previousEnableEmail
    await payload.destroy()
    await rm(directory, { recursive: true, force: true })
  }
})
