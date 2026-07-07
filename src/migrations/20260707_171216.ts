import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "search_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag_i_d" varchar,
  	"title" varchar
  );
  
  ALTER TABLE "search" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "search" ADD COLUMN "summary" varchar;
  ALTER TABLE "search" ADD COLUMN "original_title" varchar;
  ALTER TABLE "search" ADD COLUMN "original_author" varchar;
  ALTER TABLE "search" ADD COLUMN "cover_id" integer;
  ALTER TABLE "search" ADD COLUMN "topic_topic_i_d" varchar;
  ALTER TABLE "search" ADD COLUMN "topic_slug" varchar;
  ALTER TABLE "search" ADD COLUMN "topic_title" varchar;
  ALTER TABLE "search_rels" ADD COLUMN "videos_id" integer;
  ALTER TABLE "search_tags" ADD CONSTRAINT "search_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_tags_order_idx" ON "search_tags" USING btree ("_order");
  CREATE INDEX "search_tags_parent_id_idx" ON "search_tags" USING btree ("_parent_id");
  ALTER TABLE "search" ADD CONSTRAINT "search_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_hero_image_idx" ON "search" USING btree ("hero_image_id");
  CREATE INDEX "search_cover_idx" ON "search" USING btree ("cover_id");
  CREATE INDEX "search_rels_videos_id_idx" ON "search_rels" USING btree ("videos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_tags" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "search_tags" CASCADE;
  ALTER TABLE "search" DROP CONSTRAINT "search_hero_image_id_media_id_fk";
  
  ALTER TABLE "search" DROP CONSTRAINT "search_cover_id_media_id_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_videos_fk";
  
  DROP INDEX "search_hero_image_idx";
  DROP INDEX "search_cover_idx";
  DROP INDEX "search_rels_videos_id_idx";
  ALTER TABLE "search" DROP COLUMN "hero_image_id";
  ALTER TABLE "search" DROP COLUMN "summary";
  ALTER TABLE "search" DROP COLUMN "original_title";
  ALTER TABLE "search" DROP COLUMN "original_author";
  ALTER TABLE "search" DROP COLUMN "cover_id";
  ALTER TABLE "search" DROP COLUMN "topic_topic_i_d";
  ALTER TABLE "search" DROP COLUMN "topic_slug";
  ALTER TABLE "search" DROP COLUMN "topic_title";
  ALTER TABLE "search_rels" DROP COLUMN "videos_id";`)
}
