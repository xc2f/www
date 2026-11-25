import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: Pick<MigrateUpArgs, 'db'>): Promise<void> {
  await db.run(sql`ALTER TABLE moments_locales ADD COLUMN auto_translate integer`)
  await db.run(sql`ALTER TABLE _moments_v_locales ADD COLUMN version_auto_translate integer`)
}

export async function down({ db }: Pick<MigrateDownArgs, 'db'>): Promise<void> {
  await db.run(sql`ALTER TABLE moments_locales DROP COLUMN auto_translate`)
  await db.run(sql`ALTER TABLE _moments_v_locales DROP COLUMN version_auto_translate`)
}
