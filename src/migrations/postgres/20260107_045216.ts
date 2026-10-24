import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "notes_blocks_json" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"json" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_notes_v_blocks_json" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"json" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "notes_blocks_json" ADD CONSTRAINT "notes_blocks_json_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_blocks_json" ADD CONSTRAINT "_notes_v_blocks_json_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "notes_blocks_json_order_idx" ON "notes_blocks_json" USING btree ("_order");
  CREATE INDEX "notes_blocks_json_parent_id_idx" ON "notes_blocks_json" USING btree ("_parent_id");
  CREATE INDEX "notes_blocks_json_path_idx" ON "notes_blocks_json" USING btree ("_path");
  CREATE INDEX "_notes_v_blocks_json_order_idx" ON "_notes_v_blocks_json" USING btree ("_order");
  CREATE INDEX "_notes_v_blocks_json_parent_id_idx" ON "_notes_v_blocks_json" USING btree ("_parent_id");
  CREATE INDEX "_notes_v_blocks_json_path_idx" ON "_notes_v_blocks_json" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "notes_blocks_json" CASCADE;
  DROP TABLE "_notes_v_blocks_json" CASCADE;`)
}
