import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: Pick<MigrateUpArgs, 'db'>): Promise<void> {
  await db.run(sql`ALTER TABLE mails ADD COLUMN delivery_token text`)
  await db.run(sql`ALTER TABLE _mails_v ADD COLUMN version_delivery_token text`)
  // Existing jobs lack a plan token. Require a deliberate republish rather than
  // risk sending an obsolete queued snapshot after the upgrade.
  await db.run(sql`UPDATE mails SET send_status = 'cancelled',
    result = '发送计划已因升级失效，请检查内容和时间后重新发布。'
    WHERE send_status = 'pending'`)
  await db.run(sql`UPDATE _mails_v SET version_send_status = 'cancelled',
    version_result = '发送计划已因升级失效，请检查内容和时间后重新发布。'
    WHERE latest = 1 AND version_send_status = 'pending'`)
}

export async function down({ db }: Pick<MigrateDownArgs, 'db'>): Promise<void> {
  await db.run(sql`UPDATE mails SET send_status = 'failed'
    WHERE send_status IN ('sending', 'cancelled', 'uncertain')`)
  await db.run(sql`UPDATE _mails_v SET version_send_status = 'failed'
    WHERE version_send_status IN ('sending', 'cancelled', 'uncertain')`)
  await db.run(sql`ALTER TABLE mails DROP COLUMN delivery_token`)
  await db.run(sql`ALTER TABLE _mails_v DROP COLUMN version_delivery_token`)
}
