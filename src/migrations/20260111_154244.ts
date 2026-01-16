import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. 处理枚举类型添加，增加 IF NOT EXISTS 逻辑（PostgreSQL 的 DO 块）
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_payload_jobs_log_task_slug' AND e.enumlabel = 'backupDatabase') THEN
        ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'backupDatabase' BEFORE 'schedulePublish';
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_payload_jobs_task_slug' AND e.enumlabel = 'backupDatabase') THEN
        ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'backupDatabase' BEFORE 'schedulePublish';
      END IF;
    END $$;
  `)

  // 2. 创建表（增加 IF NOT EXISTS 防止重复运行报错）
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_jobs_stats" (
      "id" serial PRIMARY KEY NOT NULL,
      "stats" jsonb,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
  `)

  // 3. 修改表结构（增加列，这里也可以增加检查以确保安全）
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media' AND column_name='prefix') THEN
        ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'media';
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_jobs' AND column_name='meta') THEN
        ALTER TABLE "payload_jobs" ADD COLUMN "meta" jsonb;
      END IF;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'send-email', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'send-email', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "payload_jobs" DROP COLUMN "meta";`)
}
