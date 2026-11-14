import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Older local schema pushes may have removed this table while foreign keys
  // in the retained video and document-lock tables still reference it.
  await db.run(sql`CREATE TABLE IF NOT EXISTS video_topics (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    generate_slug integer DEFAULT true,
    slug text NOT NULL,
    updated_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    created_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  )`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS video_topics_slug_idx ON video_topics (slug)`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS video_topics_locales (
    title text NOT NULL,
    description text,
    id integer PRIMARY KEY NOT NULL,
    _locale text NOT NULL,
    _parent_id integer NOT NULL REFERENCES video_topics (id) ON DELETE cascade
  )`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS video_topics_locales_locale_parent_id_unique
    ON video_topics_locales (_locale, _parent_id)`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep the tables because existing databases may already contain archived records.
}
