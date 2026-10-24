import assert from 'node:assert/strict'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { gunzipSync } from 'node:zlib'
import { createClient } from '@libsql/client'
import { importPostgresDump } from '../../scripts/sqlite/import'
import { convertValue, decodeCopy, parseDump } from '../../scripts/sqlite/pg-dump'
import { createSqliteSnapshot } from '../../src/utilities/sqliteSnapshot'

const fixture = (parentID = 1) => `-- PostgreSQL database dump
SET client_encoding = 'UTF8';
CREATE TABLE public.parents (
    id integer NOT NULL,
    hash character varying
);
CREATE TABLE public.children (
    id integer NOT NULL,
    parent_id integer,
    title text,
    active boolean,
    data jsonb,
    created_at timestamp(3) with time zone
);
COPY public.children (id, parent_id, title, active, data, created_at) FROM stdin;
9\t${parentID}\t中文\\nEnglish\\t\\\\N\tt\t{"text":"a\\\\nb"}\t2026-10-24 08:00:00.123+08
\\.
COPY public.parents (id, hash) FROM stdin;
1\tpreserved-password-hash
\\.
ALTER SEQUENCE public.parents_id_seq OWNED BY public.parents.id;
SELECT pg_catalog.setval('public.parents_id_seq', 40, true);
-- PostgreSQL database dump complete
`

const setup = async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xc2f-migration-test-'))
  const url = `file:${path.join(directory, 'test.db')}`
  const dump = path.join(directory, 'backup.sql')
  const client = createClient({ url })
  await client.executeMultiple(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE payload_migrations (id INTEGER PRIMARY KEY, name TEXT);
    INSERT INTO payload_migrations VALUES (1, 'sqlite-baseline');
    CREATE TABLE parents (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT);
    CREATE TABLE children (id INTEGER PRIMARY KEY, parent_id INTEGER REFERENCES parents(id), title TEXT, active INTEGER, data TEXT, created_at TEXT);
  `)
  return {
    directory,
    url,
    dump,
    client,
    cleanup: async () => {
      client.close()
      await rm(directory, { recursive: true, force: true })
    },
  }
}

test('COPY handles nulls, escaped tabs/newlines/backslashes; rejects partial dumps', () => {
  assert.equal(decodeCopy('\\N'), null)
  assert.equal(decodeCopy('\\\\N'), '\\N')
  assert.equal(decodeCopy('a\\tb\\nc\\r\\\\'), 'a\tb\nc\r\\')
  assert.equal(parseDump(fixture()).length, 2)
  assert.equal(convertValue('100.00', 'numeric'), 100)
  assert.equal(convertValue('0.00000001', 'numeric'), 0.00000001)
  assert.throws(() => convertValue('9007199254740993', 'bigint'), /safely/)
  assert.throws(() => convertValue('1.1234567890123456789', 'numeric'), /precision/)
  assert.throws(
    () => parseDump(fixture().replace('-- PostgreSQL database dump complete', '')),
    /Incomplete/,
  )
  assert.throws(
    () => parseDump(fixture().replace('COPY public.children', 'COPY other.children')),
    /partial import/,
  )
})

test('imports IDs/auth/JSON/dates without hooks, preserves sequences, refuses a second import', async () => {
  const state = await setup()
  try {
    await writeFile(state.dump, fixture())
    const report = await importPostgresDump(state.dump, state.url)
    assert.equal(
      report.reduce((n, row) => n + row.rows, 0),
      2,
    )
    const row = (await state.client.execute('SELECT * FROM children')).rows[0]
    assert.equal(row.title, '中文\nEnglish\t\\N')
    assert.equal(row.active, 1)
    assert.equal(row.created_at, '2026-10-24T00:00:00.123Z')
    assert.deepEqual(JSON.parse(String(row.data)), { text: 'a\nb' })
    assert.equal(
      (await state.client.execute('SELECT hash FROM parents')).rows[0].hash,
      'preserved-password-hash',
    )
    assert.equal(
      (await state.client.execute('SELECT name FROM payload_migrations')).rows[0].name,
      'sqlite-baseline',
    )
    const next = await state.client.execute(
      "INSERT INTO parents (hash) VALUES ('new-user') RETURNING id",
    )
    assert.equal(next.rows[0].id, 41)
    await assert.rejects(importPostgresDump(state.dump, state.url), /not empty/)
  } finally {
    await state.cleanup()
  }
})

test('foreign key failures roll back every imported table', async () => {
  const state = await setup()
  try {
    await writeFile(state.dump, fixture(999))
    await assert.rejects(importPostgresDump(state.dump, state.url), /Foreign key check failed/)
    assert.equal((await state.client.execute('SELECT COUNT(*) AS n FROM parents')).rows[0].n, 0)
    assert.equal((await state.client.execute('SELECT COUNT(*) AS n FROM children')).rows[0].n, 0)
  } finally {
    await state.cleanup()
  }
})

test('backup restores committed WAL data into a standalone database', async () => {
  const state = await setup()
  try {
    await state.client.execute("INSERT INTO parents VALUES (8, 'wal-data')")
    const snapshot = path.join(state.directory, 'snapshot.db')
    const compressed = path.join(state.directory, 'backup.sqlite.gz')
    await createSqliteSnapshot(state.url, snapshot, compressed)
    const restored = path.join(state.directory, 'restored.db')
    await writeFile(restored, gunzipSync(await readFile(compressed)))
    const client = createClient({ url: `file:${restored}` })
    try {
      assert.equal(
        (await client.execute('SELECT hash FROM parents WHERE id = 8')).rows[0].hash,
        'wal-data',
      )
      assert.equal((await client.execute('PRAGMA integrity_check')).rows[0].integrity_check, 'ok')
    } finally {
      client.close()
    }
  } finally {
    await state.cleanup()
  }
})
