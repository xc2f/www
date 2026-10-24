import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_categories" ADD COLUMN "category_id" varchar;
  ALTER TABLE "search_categories" DROP COLUMN "category_i_d";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_categories" ADD COLUMN "category_i_d" varchar;
  ALTER TABLE "search_categories" DROP COLUMN "category_id";`)
}
