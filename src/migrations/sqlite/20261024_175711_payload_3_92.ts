import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`media\` ADD \`_objectkey\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_requested_at\` text;`)
  await db.run(
    sql`CREATE INDEX \`media_locales_parent_id_idx\` ON \`media_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_locales_parent_id_idx\` ON \`pages_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_locales_parent_id_idx\` ON \`_pages_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`posts_locales_parent_id_idx\` ON \`posts_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_locales_parent_id_idx\` ON \`_posts_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`categories_locales_parent_id_idx\` ON \`categories_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`moments_locales_parent_id_idx\` ON \`moments_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_moments_v_locales_parent_id_idx\` ON \`_moments_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`video_topics_locales_parent_id_idx\` ON \`video_topics_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`tags_locales_parent_id_idx\` ON \`tags_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`videos_locales_parent_id_idx\` ON \`videos_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_videos_v_locales_parent_id_idx\` ON \`_videos_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_checkbox_locales_parent_id_idx\` ON \`forms_blocks_checkbox_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_country_locales_parent_id_idx\` ON \`forms_blocks_country_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_email_locales_parent_id_idx\` ON \`forms_blocks_email_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_message_locales_parent_id_idx\` ON \`forms_blocks_message_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_number_locales_parent_id_idx\` ON \`forms_blocks_number_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_select_options_locales_parent_id_idx\` ON \`forms_blocks_select_options_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_select_locales_parent_id_idx\` ON \`forms_blocks_select_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_state_locales_parent_id_idx\` ON \`forms_blocks_state_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_text_locales_parent_id_idx\` ON \`forms_blocks_text_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_blocks_textarea_locales_parent_id_idx\` ON \`forms_blocks_textarea_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_emails_locales_parent_id_idx\` ON \`forms_emails_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`forms_locales_parent_id_idx\` ON \`forms_locales\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`search_locales_parent_id_idx\` ON \`search_locales\` (\`_parent_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`media_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`pages_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`_pages_v_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`posts_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`_posts_v_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`categories_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`moments_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`_moments_v_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`video_topics_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`tags_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`videos_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`_videos_v_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_checkbox_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_country_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_email_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_message_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_number_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_select_options_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_select_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_state_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_text_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_blocks_textarea_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_emails_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`forms_locales_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX \`search_locales_parent_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`_objectkey\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_requested_at\`;`)
}
