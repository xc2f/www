import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createClient } from '@libsql/client'
import { drizzle } from '@payloadcms/db-sqlite/drizzle/libsql'
import {
  up as auditUp,
  down as auditDown,
} from '../../src/migrations/sqlite/20261120_mail_delivery_recovery'
import { up, down } from '../../src/migrations/sqlite/20261120_mail_delivery_plans'

test('mail migration invalidates legacy plans while preserving sent mail and history', async () => {
  const client = createClient({ url: ':memory:' })
  const db = drizzle(client)
  try {
    await client.executeMultiple(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE video_topics (id integer PRIMARY KEY, title text);
      INSERT INTO video_topics VALUES (1, 'Retained archive');
      CREATE TABLE mails (id integer PRIMARY KEY, send_status text, result text);
      CREATE TABLE _mails_v (id integer PRIMARY KEY, latest integer, version_send_status text, version_result text);
      INSERT INTO mails VALUES (1, 'pending', NULL), (2, 'sent', 'ok');
      INSERT INTO _mails_v VALUES (1, 1, 'pending', NULL), (2, 0, 'pending', NULL), (3, 1, 'sent', 'ok');
    `)
    await up({ db })
    const mails = (await client.execute('SELECT * FROM mails ORDER BY id')).rows
    assert.equal(mails[0].send_status, 'cancelled')
    assert.equal(mails[0].delivery_token, null)
    assert.equal(mails[1].send_status, 'sent')
    assert.equal(mails[1].result, 'ok')
    const versions = (await client.execute('SELECT * FROM _mails_v ORDER BY id')).rows
    assert.equal(versions[0].version_send_status, 'cancelled')
    assert.equal(versions[1].version_send_status, 'pending')
    assert.equal(versions[2].version_send_status, 'sent')
    await auditUp({ db })
    await client.executeMultiple(`
      INSERT INTO mails_delivery_history (_order, _parent_id, id, attempt_id, outcome, message_id)
        VALUES (0, 2, 'row-1', 'attempt-1', 'sent', 'provider-id');
      INSERT INTO _mails_v_version_delivery_history (_order, _parent_id, attempt_id, outcome, _uuid)
        VALUES (0, 3, 'attempt-1', 'sent', 'row-1');
      UPDATE mails SET message_id = 'provider-id', send_started_at = '2026-11-20T00:00:00Z' WHERE id = 2;
    `)
    assert.equal(
      (await client.execute('SELECT message_id FROM mails_delivery_history')).rows[0].message_id,
      'provider-id',
    )
    assert.equal(
      (await client.execute('SELECT COUNT(*) AS count FROM _mails_v_version_delivery_history'))
        .rows[0].count,
      1,
    )
    assert.equal(
      (await client.execute('SELECT title FROM video_topics')).rows[0].title,
      'Retained archive',
    )
    await auditDown({ db })
    assert.equal(
      (await client.execute('SELECT send_status FROM mails WHERE id = 2')).rows[0].send_status,
      'sent',
    )
    await down({ db })
    assert.equal(
      (await client.execute('SELECT send_status FROM mails WHERE id = 1')).rows[0].send_status,
      'failed',
    )
    assert.equal(
      (await client.execute('SELECT send_status FROM mails WHERE id = 2')).rows[0].send_status,
      'sent',
    )
  } finally {
    client.close()
  }
})
