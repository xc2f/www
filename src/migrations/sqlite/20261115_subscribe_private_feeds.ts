import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE feeds ADD COLUMN visibility text DEFAULT 'public'`)
  await db.run(sql`ALTER TABLE _feeds_v ADD COLUMN version_visibility text DEFAULT 'public'`)
  // Store credentials outside Payload's content versions.
  await db.run(sql`
    CREATE TABLE feed_subscription_tokens (
      id TEXT PRIMARY KEY NOT NULL,
      feed_id INTEGER NOT NULL REFERENCES feeds (id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE
    )
  `)
  await db.run(sql`CREATE INDEX feed_subscription_tokens_feed_idx ON feed_subscription_tokens (feed_id)`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Older application versions treat any published feed as public.
  await db.run(sql`
    UPDATE _feeds_v
    SET version__status = 'draft'
    WHERE version_visibility = 'private'
      OR (latest = 1 AND parent_id IN (SELECT id FROM feeds WHERE visibility = 'private'))
  `)
  await db.run(sql`UPDATE feeds SET _status = 'draft' WHERE visibility = 'private'`)
  await db.run(sql`DROP TABLE feed_subscription_tokens`)
  await db.run(sql`ALTER TABLE _feeds_v DROP COLUMN version_visibility`)
  await db.run(sql`ALTER TABLE feeds DROP COLUMN visibility`)
}
