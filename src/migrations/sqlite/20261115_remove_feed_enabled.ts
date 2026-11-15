import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Convert disabled feeds to drafts before dropping the old visibility flag.
  await db.run(sql`
    UPDATE _feeds_v
    SET version__status = 'draft'
    WHERE version__status = 'published'
      AND (
        version_enabled IS NOT 1
        OR (latest = 1 AND parent_id IN (SELECT id FROM feeds WHERE enabled IS NOT 1))
      )
  `)
  await db.run(sql`
    UPDATE feeds
    SET _status = 'draft'
    WHERE _status = 'published' AND enabled IS NOT 1
  `)

  await db.run(sql`ALTER TABLE feeds DROP COLUMN enabled`)
  await db.run(sql`ALTER TABLE _feeds_v DROP COLUMN version_enabled`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Keep converted feeds unpublished when restoring the old schema.
  await db.run(sql`ALTER TABLE feeds ADD COLUMN enabled integer DEFAULT true`)
  await db.run(sql`ALTER TABLE _feeds_v ADD COLUMN version_enabled integer DEFAULT true`)
}
