import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_tags'
          AND column_name = 'tag_i_d'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_tags'
          AND column_name = 'tag_id'
      ) THEN
        ALTER TABLE "search_tags" RENAME COLUMN "tag_i_d" TO "tag_id";
      ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_tags'
          AND column_name = 'tag_i_d'
      ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_tags'
          AND column_name = 'tag_id'
      ) THEN
        UPDATE "search_tags" SET "tag_id" = "tag_i_d" WHERE "tag_id" IS NULL;
        ALTER TABLE "search_tags" DROP COLUMN "tag_i_d";
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_tags'
          AND column_name = 'tag_id'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_tags'
          AND column_name = 'tag_i_d'
      ) THEN
        ALTER TABLE "search_tags" RENAME COLUMN "tag_id" TO "tag_i_d";
      ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_tags'
          AND column_name = 'tag_id'
      ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_tags'
          AND column_name = 'tag_i_d'
      ) THEN
        UPDATE "search_tags" SET "tag_i_d" = "tag_id" WHERE "tag_i_d" IS NULL;
        ALTER TABLE "search_tags" DROP COLUMN "tag_id";
      END IF;
    END $$;
  `)
}
