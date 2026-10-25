import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, getPayload } from 'payload'
import { recoverBackupJobs } from '../../src/utilities/recoverBackupJobs'

test('startup recovery releases only interrupted backups and respects disabled jobs/builds', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xc2f-recovery-test-'))
  const previousDisabled = process.env.DISABLE_BACKGROUND_JOBS
  const previousPhase = process.env.NEXT_PHASE
  const payload = await getPayload({
    config: buildConfig({
      secret: 'backup-recovery-test-secret',
      db: sqliteAdapter({ client: { url: `file:${path.join(directory, 'test.db')}` } }),
      collections: [],
      jobs: {
        autoRun: [],
        tasks: [
          { slug: 'backupDatabase', handler: async () => ({ output: {} }) },
          { slug: 'send-email', handler: async () => ({ output: {} }) },
        ],
      },
    }),
  })

  try {
    const base = {
      taskSlug: 'backupDatabase' as const,
      processing: true,
      updatedAt: '2000-01-01T00:00:00.000Z',
    }
    const interrupted = await payload.create({ collection: 'payload-jobs', data: base })
    const preserved = await Promise.all(
      [
        { ...base, updatedAt: '2100-01-01T00:00:00.000Z' },
        { ...base, completedAt: '2000-01-01T00:01:00.000Z' },
        { ...base, hasError: true },
        { ...base, error: { message: 'terminal failure' } },
        { ...base, taskSlug: 'send-email' as const },
        { ...base, processing: false },
      ].map((data) => payload.create({ collection: 'payload-jobs', data })),
    )
    const read = (id: number) => payload.findByID({ collection: 'payload-jobs', id })

    process.env.DISABLE_BACKGROUND_JOBS = 'true'
    await recoverBackupJobs(payload)
    assert.equal((await read(interrupted.id)).processing, true)

    process.env.DISABLE_BACKGROUND_JOBS = 'false'
    process.env.NEXT_PHASE = 'phase-production-build'
    await recoverBackupJobs(payload)
    assert.equal((await read(interrupted.id)).processing, true)

    delete process.env.NEXT_PHASE
    await recoverBackupJobs(payload)
    const recovered = await read(interrupted.id)
    assert.equal(recovered.processing, false)
    assert.equal(recovered.totalTried, interrupted.totalTried)
    assert.equal(recovered.waitUntil, interrupted.waitUntil)
    for (const job of preserved) {
      const actual = await read(job.id)
      assert.equal(actual.processing, job.processing)
      assert.equal(actual.updatedAt, job.updatedAt)
    }

    await recoverBackupJobs(payload)
    assert.equal((await read(interrupted.id)).updatedAt, recovered.updatedAt)
  } finally {
    if (previousDisabled === undefined) delete process.env.DISABLE_BACKGROUND_JOBS
    else process.env.DISABLE_BACKGROUND_JOBS = previousDisabled
    if (previousPhase === undefined) delete process.env.NEXT_PHASE
    else process.env.NEXT_PHASE = previousPhase
    await payload.destroy()
    await rm(directory, { recursive: true, force: true })
  }
})
