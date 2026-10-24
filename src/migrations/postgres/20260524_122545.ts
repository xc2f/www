import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "moments_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "_moments_v_locales" ADD COLUMN "version_title" varchar;
  ALTER TABLE "moments" DROP COLUMN "title";
  ALTER TABLE "_moments_v" DROP COLUMN "version_title";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "moments" ADD COLUMN "title" varchar;
  ALTER TABLE "_moments_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "moments_locales" DROP COLUMN "title";
  ALTER TABLE "_moments_v_locales" DROP COLUMN "version_title";`)
}
