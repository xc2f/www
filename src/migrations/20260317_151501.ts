import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "moments" DROP COLUMN "published";
  ALTER TABLE "_moments_v" DROP COLUMN "version_published";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "moments" ADD COLUMN "published" boolean DEFAULT true;
  ALTER TABLE "_moments_v" ADD COLUMN "version_published" boolean DEFAULT true;`)
}
