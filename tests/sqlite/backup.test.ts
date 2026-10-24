import assert from 'node:assert/strict'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { gunzipSync } from 'node:zlib'
import { createClient } from '@libsql/client'
import { createSqliteSnapshot } from '../../src/utilities/sqliteSnapshot'

test('backup restores committed WAL data into a standalone database', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xc2f-backup-test-'))
  const url = `file:${path.join(directory, 'source.db')}`
  const source = createClient({ url })
  try {
    await source.executeMultiple(`
      PRAGMA journal_mode=WAL;
      CREATE TABLE entries (id INTEGER PRIMARY KEY, content TEXT);
      INSERT INTO entries VALUES (8, 'wal-data');
    `)
    const snapshot = path.join(directory, 'snapshot.db')
    const compressed = path.join(directory, 'backup.sqlite.gz')
    await createSqliteSnapshot(url, snapshot, compressed)
    const restored = path.join(directory, 'restored.db')
    await writeFile(restored, gunzipSync(await readFile(compressed)))
    const client = createClient({ url: `file:${restored}` })
    try {
      assert.equal(
        (await client.execute('SELECT content FROM entries WHERE id = 8')).rows[0].content,
        'wal-data',
      )
      assert.equal((await client.execute('PRAGMA integrity_check')).rows[0].integrity_check, 'ok')
    } finally {
      client.close()
    }
  } finally {
    source.close()
    await rm(directory, { recursive: true, force: true })
  }
})
