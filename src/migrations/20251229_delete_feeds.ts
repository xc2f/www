// import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
//   await db.execute(sql`
//     ALTER TABLE feeds
//     DROP COLUMN key;
//   `)
// }

// export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
//   await db.execute(sql`
//     ALTER TABLE _posts_v
//     DROP COLUMN version_title;
//   `)
//   await db.execute(sql`
//     ALTER TABLE _posts_v
//     DROP COLUMN version_content;
//   `)

//   await db.execute(sql`
//     ALTER TABLE posts
//     DROP COLUMN title;
//   `)
//   await db.execute(sql`
//     ALTER TABLE posts
//     DROP COLUMN content;
//   `)
// }
