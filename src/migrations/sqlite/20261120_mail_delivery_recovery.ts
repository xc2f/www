import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: Pick<MigrateUpArgs, 'db'>): Promise<void> {
  await db.run(sql`CREATE TABLE mails_delivery_history (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id text PRIMARY KEY NOT NULL,
    attempt_id text,
    job_id text,
    started_at text,
    finished_at text,
    accepted_at text,
    outcome text,
    message_id text,
    error text,
    resolution text,
    resolved_at text,
    resolved_by text,
    resolution_note text,
    FOREIGN KEY (_parent_id) REFERENCES mails(id) ON DELETE cascade
  )`)
  await db.run(
    sql`CREATE INDEX mails_delivery_history_order_idx ON mails_delivery_history (_order)`,
  )
  await db.run(
    sql`CREATE INDEX mails_delivery_history_parent_id_idx ON mails_delivery_history (_parent_id)`,
  )
  await db.run(sql`CREATE TABLE _mails_v_version_delivery_history (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    attempt_id text,
    job_id text,
    started_at text,
    finished_at text,
    accepted_at text,
    outcome text,
    message_id text,
    error text,
    resolution text,
    resolved_at text,
    resolved_by text,
    resolution_note text,
    _uuid text,
    FOREIGN KEY (_parent_id) REFERENCES _mails_v(id) ON DELETE cascade
  )`)
  await db.run(
    sql`CREATE INDEX _mails_v_version_delivery_history_order_idx ON _mails_v_version_delivery_history (_order)`,
  )
  await db.run(
    sql`CREATE INDEX _mails_v_version_delivery_history_parent_id_idx ON _mails_v_version_delivery_history (_parent_id)`,
  )
  await db.run(sql`ALTER TABLE mails ADD COLUMN send_started_at text`)
  await db.run(sql`ALTER TABLE mails ADD COLUMN sent_at text`)
  await db.run(sql`ALTER TABLE mails ADD COLUMN message_id text`)
  await db.run(sql`ALTER TABLE mails ADD COLUMN active_attempt text`)
  await db.run(sql`ALTER TABLE _mails_v ADD COLUMN version_send_started_at text`)
  await db.run(sql`ALTER TABLE _mails_v ADD COLUMN version_sent_at text`)
  await db.run(sql`ALTER TABLE _mails_v ADD COLUMN version_message_id text`)
  await db.run(sql`ALTER TABLE _mails_v ADD COLUMN version_active_attempt text`)
}

export async function down({ db }: Pick<MigrateDownArgs, 'db'>): Promise<void> {
  await db.run(sql`DROP TABLE mails_delivery_history`)
  await db.run(sql`DROP TABLE _mails_v_version_delivery_history`)
  await db.run(sql`ALTER TABLE mails DROP COLUMN send_started_at`)
  await db.run(sql`ALTER TABLE mails DROP COLUMN sent_at`)
  await db.run(sql`ALTER TABLE mails DROP COLUMN message_id`)
  await db.run(sql`ALTER TABLE mails DROP COLUMN active_attempt`)
  await db.run(sql`ALTER TABLE _mails_v DROP COLUMN version_send_started_at`)
  await db.run(sql`ALTER TABLE _mails_v DROP COLUMN version_sent_at`)
  await db.run(sql`ALTER TABLE _mails_v DROP COLUMN version_message_id`)
  await db.run(sql`ALTER TABLE _mails_v DROP COLUMN version_active_attempt`)
}
