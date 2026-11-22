import type { Payload } from 'payload'
import { recoverMailDeliveries } from './mailDelivery'

/** SQLite has one writer; overlapping job transactions can fail with SQLITE_BUSY. */
export const serializeSqliteJobs = (payload: Payload): void => {
  const run = payload.jobs.run.bind(payload.jobs)
  let previous: Promise<void> = Promise.resolve()
  payload.jobs.run = (args) => {
    // Requests enforcing access must reach Payload's access check before side effects.
    const ready = previous.then(() =>
      args?.overrideAccess === false ? undefined : recoverMailDeliveries(payload),
    )
    const current = ready.then(() => run({ ...args, sequential: true }))
    // A failed run must not prevent the next cron tick from processing jobs.
    previous = current.then(
      () => undefined,
      () => undefined,
    )
    return current
  }
}
