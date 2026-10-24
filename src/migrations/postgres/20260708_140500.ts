import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "search_locales" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
    ALTER TABLE "search_locales" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "search_locales" ADD COLUMN IF NOT EXISTS "summary" varchar;

    UPDATE "search_locales" "search_locale"
    SET
      "meta_title" = COALESCE("posts_locale"."meta_title", "posts_locale"."title", "search"."meta_title", "search_locale"."meta_title"),
      "meta_description" = COALESCE("posts_locale"."meta_description", "search"."meta_description", "search_locale"."meta_description")
    FROM "search" "search", "search_rels" "search_rel", "posts_locales" "posts_locale"
    WHERE "search_locale"."_parent_id" = "search"."id"
      AND "search_rel"."parent_id" = "search"."id"
      AND "search_rel"."path" = 'doc'
      AND "search_rel"."posts_id" IS NOT NULL
      AND "posts_locale"."_parent_id" = "search_rel"."posts_id"
      AND "posts_locale"."_locale" = "search_locale"."_locale";

    UPDATE "search_locales" "search_locale"
    SET
      "summary" = COALESCE("videos_locale"."summary", "search"."summary", "search_locale"."summary")
    FROM "search" "search", "search_rels" "search_rel", "videos_locales" "videos_locale"
    WHERE "search_locale"."_parent_id" = "search"."id"
      AND "search_rel"."parent_id" = "search"."id"
      AND "search_rel"."path" = 'doc'
      AND "search_rel"."videos_id" IS NOT NULL
      AND "videos_locale"."_parent_id" = "search_rel"."videos_id"
      AND "videos_locale"."_locale" = "search_locale"."_locale";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "search_locales" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "search_locales" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "search_locales" DROP COLUMN IF EXISTS "meta_title";
  `)
}
