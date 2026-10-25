import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import {
  evaluateBackupStatus,
  readBackupStatus,
  recordBackupResult,
} from '../../src/utilities/backupStatus'
import { createSqliteSnapshot } from '../../src/utilities/sqliteSnapshot'

test('backup monitor persists success across failures, recovers and detects overdue backups', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xc2f-status-test-'))
  const databasePath = path.join(directory, 'test.db')
  const url = `file:${databasePath}`
  try {
    assert.equal(evaluateBackupStatus(await readBackupStatus(url)).healthy, false)
    await recordBackupResult({ fileName: 'backup-test.sqlite.gz' }, url)
    const first = await readBackupStatus(url)
    assert.equal(evaluateBackupStatus(first).healthy, true)
    assert.equal(
      evaluateBackupStatus(first, Date.parse(first.lastSuccessAt!) + 27 * 3600000).healthy,
      false,
    )
    await recordBackupResult({ failed: true }, url)
    const failed = await readBackupStatus(url)
    assert.equal(failed.lastSuccessAt, first.lastSuccessAt)
    assert.equal(evaluateBackupStatus(failed).healthy, false)
    await recordBackupResult({ fileName: 'backup-recovered.sqlite.gz' }, url)
    const recovered = await readBackupStatus(url)
    assert.equal(evaluateBackupStatus(recovered).healthy, true)
    assert.equal(recovered.fileName, 'backup-recovered.sqlite.gz')
    assert.equal(
      JSON.parse(await readFile(`${databasePath}.backup-status.json`, 'utf8')).lastOutcome,
      'success',
    )
    await writeFile(`${databasePath}.backup-status.json`, '{broken')
    await assert.rejects(readBackupStatus(url))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('snapshot honors cancellation without publishing a compressed backup', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xc2f-abort-test-'))
  try {
    const compressed = path.join(directory, 'backup.gz')
    await assert.rejects(
      createSqliteSnapshot(
        `file:${path.join(directory, 'source.db')}`,
        path.join(directory, 'snapshot.db'),
        compressed,
        AbortSignal.abort(),
      ),
      { name: 'AbortError' },
    )
    await assert.rejects(readFile(compressed), { code: 'ENOENT' })
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
