import type { Payload } from 'payload'

// The production deployment has one Node process and one SQLite database.
// Do not use this recovery strategy with concurrent workers sharing that database.
const processStartedAt = new Date(Date.now() - process.uptime() * 1000).toISOString()

export async function recoverBackupJobs(payload: Payload) {
  if (
    process.env.DISABLE_BACKGROUND_JOBS === 'true' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    return
  }

  // Intentional system operation: only release unfinished backup jobs claimed
  // before this process existed. Leave other tasks and terminal errors untouched.
  const result = await payload.update({
    collection: 'payload-jobs',
    overrideAccess: true,
    depth: 0,
    where: {
      and: [
        { taskSlug: { equals: 'backupDatabase' } },
        { processing: { equals: true } },
        { completedAt: { exists: false } },
        { hasError: { not_equals: true } },
        { error: { exists: false } },
        { updatedAt: { less_than: processStartedAt } },
      ],
    },
    data: { processing: false },
  })

  if (result.errors.length) {
    throw new Error(`Failed to recover backup jobs: ${JSON.stringify(result.errors)}`)
  }

  if (result.docs.length) {
    payload.logger.warn(
      { jobIDs: result.docs.map(({ id }) => id) },
      'Recovered interrupted database backup jobs; the queue will retry them.',
    )
  }
}
