import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_notes_blocks_code_language" ADD VALUE 'html' BEFORE 'css';
  ALTER TYPE "public"."enum_notes_blocks_code_language" ADD VALUE 'json';
  ALTER TYPE "public"."enum_notes_blocks_code_language" ADD VALUE 'yaml';
  ALTER TYPE "public"."enum_notes_blocks_code_language" ADD VALUE 'bash';
  ALTER TYPE "public"."enum_notes_blocks_code_language" ADD VALUE 'markdown';
  ALTER TYPE "public"."enum__notes_v_blocks_code_language" ADD VALUE 'html' BEFORE 'css';
  ALTER TYPE "public"."enum__notes_v_blocks_code_language" ADD VALUE 'json';
  ALTER TYPE "public"."enum__notes_v_blocks_code_language" ADD VALUE 'yaml';
  ALTER TYPE "public"."enum__notes_v_blocks_code_language" ADD VALUE 'bash';
  ALTER TYPE "public"."enum__notes_v_blocks_code_language" ADD VALUE 'markdown';
  ALTER TABLE "posts" ADD COLUMN "github_discussion_url" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_github_discussion_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "notes_blocks_code" ALTER COLUMN "language" SET DATA TYPE text;
  ALTER TABLE "notes_blocks_code" ALTER COLUMN "language" SET DEFAULT 'typescript'::text;
  DROP TYPE "public"."enum_notes_blocks_code_language";
  CREATE TYPE "public"."enum_notes_blocks_code_language" AS ENUM('typescript', 'javascript', 'css');
  ALTER TABLE "notes_blocks_code" ALTER COLUMN "language" SET DEFAULT 'typescript'::"public"."enum_notes_blocks_code_language";
  ALTER TABLE "notes_blocks_code" ALTER COLUMN "language" SET DATA TYPE "public"."enum_notes_blocks_code_language" USING "language"::"public"."enum_notes_blocks_code_language";
  ALTER TABLE "_notes_v_blocks_code" ALTER COLUMN "language" SET DATA TYPE text;
  ALTER TABLE "_notes_v_blocks_code" ALTER COLUMN "language" SET DEFAULT 'typescript'::text;
  DROP TYPE "public"."enum__notes_v_blocks_code_language";
  CREATE TYPE "public"."enum__notes_v_blocks_code_language" AS ENUM('typescript', 'javascript', 'css');
  ALTER TABLE "_notes_v_blocks_code" ALTER COLUMN "language" SET DEFAULT 'typescript'::"public"."enum__notes_v_blocks_code_language";
  ALTER TABLE "_notes_v_blocks_code" ALTER COLUMN "language" SET DATA TYPE "public"."enum__notes_v_blocks_code_language" USING "language"::"public"."enum__notes_v_blocks_code_language";
  ALTER TABLE "posts" DROP COLUMN "github_discussion_url";
  ALTER TABLE "_posts_v" DROP COLUMN "version_github_discussion_url";`)
}
