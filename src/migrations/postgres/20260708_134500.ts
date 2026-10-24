import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search'
          AND column_name = 'topic_topic_i_d'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search'
          AND column_name = 'topic_topic_id'
      ) THEN
        ALTER TABLE "search" RENAME COLUMN "topic_topic_i_d" TO "topic_topic_id";
      ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search'
          AND column_name = 'topic_topic_i_d'
      ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search'
          AND column_name = 'topic_topic_id'
      ) THEN
        UPDATE "search" SET "topic_topic_id" = "topic_topic_i_d" WHERE "topic_topic_id" IS NULL;
        ALTER TABLE "search" DROP COLUMN "topic_topic_i_d";
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
          AND table_name = 'search'
          AND column_name = 'topic_topic_id'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search'
          AND column_name = 'topic_topic_i_d'
      ) THEN
        ALTER TABLE "search" RENAME COLUMN "topic_topic_id" TO "topic_topic_i_d";
      ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search'
          AND column_name = 'topic_topic_id'
      ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search'
          AND column_name = 'topic_topic_i_d'
      ) THEN
        UPDATE "search" SET "topic_topic_i_d" = "topic_topic_id" WHERE "topic_topic_i_d" IS NULL;
        ALTER TABLE "search" DROP COLUMN "topic_topic_id";
      END IF;
    END $$;
  `)
}
