import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_moments_mood" AS ENUM('happy', 'calm', 'thoughtful', 'tired', 'sad', 'energized', 'content', 'neutral');
  CREATE TYPE "public"."enum_moments_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__moments_v_version_mood" AS ENUM('happy', 'calm', 'thoughtful', 'tired', 'sad', 'energized', 'content', 'neutral');
  CREATE TYPE "public"."enum__moments_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__moments_v_published_locale" AS ENUM('zh', 'en');
  CREATE TABLE "moments_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "moments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mood" "enum_moments_mood" DEFAULT 'neutral',
  	"published" boolean DEFAULT true,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_moments_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "moments_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_moments_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_moments_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_mood" "enum__moments_v_version_mood" DEFAULT 'neutral',
  	"version_published" boolean DEFAULT true,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__moments_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__moments_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_moments_v_locales" (
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "moments_id" integer;
  ALTER TABLE "moments_images" ADD CONSTRAINT "moments_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "moments_images" ADD CONSTRAINT "moments_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "moments_locales" ADD CONSTRAINT "moments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_moments_v_version_images" ADD CONSTRAINT "_moments_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_moments_v_version_images" ADD CONSTRAINT "_moments_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_moments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_moments_v" ADD CONSTRAINT "_moments_v_parent_id_moments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."moments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_moments_v_locales" ADD CONSTRAINT "_moments_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_moments_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "moments_images_order_idx" ON "moments_images" USING btree ("_order");
  CREATE INDEX "moments_images_parent_id_idx" ON "moments_images" USING btree ("_parent_id");
  CREATE INDEX "moments_images_image_idx" ON "moments_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "moments_slug_idx" ON "moments" USING btree ("slug");
  CREATE INDEX "moments_updated_at_idx" ON "moments" USING btree ("updated_at");
  CREATE INDEX "moments_created_at_idx" ON "moments" USING btree ("created_at");
  CREATE INDEX "moments__status_idx" ON "moments" USING btree ("_status");
  CREATE UNIQUE INDEX "moments_locales_locale_parent_id_unique" ON "moments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_moments_v_version_images_order_idx" ON "_moments_v_version_images" USING btree ("_order");
  CREATE INDEX "_moments_v_version_images_parent_id_idx" ON "_moments_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_moments_v_version_images_image_idx" ON "_moments_v_version_images" USING btree ("image_id");
  CREATE INDEX "_moments_v_parent_idx" ON "_moments_v" USING btree ("parent_id");
  CREATE INDEX "_moments_v_version_version_slug_idx" ON "_moments_v" USING btree ("version_slug");
  CREATE INDEX "_moments_v_version_version_updated_at_idx" ON "_moments_v" USING btree ("version_updated_at");
  CREATE INDEX "_moments_v_version_version_created_at_idx" ON "_moments_v" USING btree ("version_created_at");
  CREATE INDEX "_moments_v_version_version__status_idx" ON "_moments_v" USING btree ("version__status");
  CREATE INDEX "_moments_v_created_at_idx" ON "_moments_v" USING btree ("created_at");
  CREATE INDEX "_moments_v_updated_at_idx" ON "_moments_v" USING btree ("updated_at");
  CREATE INDEX "_moments_v_snapshot_idx" ON "_moments_v" USING btree ("snapshot");
  CREATE INDEX "_moments_v_published_locale_idx" ON "_moments_v" USING btree ("published_locale");
  CREATE INDEX "_moments_v_latest_idx" ON "_moments_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_moments_v_locales_locale_parent_id_unique" ON "_moments_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_moments_fk" FOREIGN KEY ("moments_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_moments_id_idx" ON "payload_locked_documents_rels" USING btree ("moments_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "moments_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "moments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "moments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_moments_v_version_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_moments_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_moments_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "moments_images" CASCADE;
  DROP TABLE "moments" CASCADE;
  DROP TABLE "moments_locales" CASCADE;
  DROP TABLE "_moments_v_version_images" CASCADE;
  DROP TABLE "_moments_v" CASCADE;
  DROP TABLE "_moments_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_moments_fk";
  
  DROP INDEX "payload_locked_documents_rels_moments_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "moments_id";
  DROP TYPE "public"."enum_moments_mood";
  DROP TYPE "public"."enum_moments_status";
  DROP TYPE "public"."enum__moments_v_version_mood";
  DROP TYPE "public"."enum__moments_v_version_status";
  DROP TYPE "public"."enum__moments_v_published_locale";`)
}
