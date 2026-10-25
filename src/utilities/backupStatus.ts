import { randomUUID } from 'node:crypto'
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { sqliteFilePath, sqliteURL } from './sqlite'

type BackupStatus = {
  lastSuccessAt?: string
  fileName?: string
  lastFailureAt?: string
  lastOutcome?: 'success' | 'failure'
}

const statusPath = (url: string) => `${sqliteFilePath(url)}.backup-status.json`

export async function readBackupStatus(url = sqliteURL()): Promise<BackupStatus> {
  try {
    const value: unknown = JSON.parse(await readFile(statusPath(url), 'utf8'))
    if (!value || typeof value !== 'object') throw new Error('Invalid backup status file')
    const status = value as BackupStatus
    if (status.lastOutcome !== undefined && !['success', 'failure'].includes(status.lastOutcome)) {
      throw new Error('Invalid backup status outcome')
    }
    for (const date of [status.lastSuccessAt, status.lastFailureAt]) {
      if (date !== undefined && (typeof date !== 'string' || !Number.isFinite(Date.parse(date)))) {
        throw new Error('Invalid backup status timestamp')
      }
    }
    return status
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw error
  }
}

let pendingWrite: Promise<void> = Promise.resolve()

export function recordBackupResult(
  result: { fileName: string } | { failed: true },
  url = sqliteURL(),
) {
  const write = pendingWrite.then(() => writeBackupResult(result, url))
  pendingWrite = write.catch(() => undefined)
  return write
}

async function writeBackupResult(result: { fileName: string } | { failed: true }, url: string) {
  const previous = await readBackupStatus(url)
  const now = new Date().toISOString()
  const status: BackupStatus =
    'fileName' in result
      ? { ...previous, lastSuccessAt: now, fileName: result.fileName, lastOutcome: 'success' }
      : { ...previous, lastFailureAt: now, lastOutcome: 'failure' }
  const destination = statusPath(url)
  const temporary = `${destination}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, JSON.stringify(status), { flag: 'wx', mode: 0o600 })
    await rename(temporary, destination)
  } finally {
    await rm(temporary, { force: true })
  }
}

export function evaluateBackupStatus(status: BackupStatus, now = Date.now()) {
  const lastSuccess = status.lastSuccessAt ? Date.parse(status.lastSuccessAt) : undefined
  const lastFailure = status.lastFailureAt ? Date.parse(status.lastFailureAt) : undefined
  const healthy =
    lastSuccess !== undefined &&
    lastSuccess <= now &&
    now - lastSuccess <= 26 * 60 * 60 * 1000 &&
    (status.lastOutcome === 'success' ||
      (status.lastOutcome !== 'failure' &&
        (lastFailure === undefined || lastFailure < lastSuccess)))
  return { ...status, healthy }
}
