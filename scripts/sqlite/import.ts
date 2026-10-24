import { createClient } from '@libsql/client'
import { readFile, stat } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'
import { pathToFileURL } from 'node:url'
import { sqliteFilePath } from '../../src/utilities/sqlite'
import { convertValue, parseDump, quoteIdentifier, rowsDigest } from './pg-dump'

export const importPostgresDump = async (source: string, destination: string) => {
  const filename = sqliteFilePath(destination)
  await stat(filename) // Never create an uninitialized destination by accident.
  const backup = await readFile(source)
  const sql = (source.endsWith('.gz') ? gunzipSync(backup) : backup).toString('utf8')
  const tables = parseDump(sql)
  const client = createClient({ url: pathToFileURL(filename).href })
  try {
    await client.execute('PRAGMA foreign_keys = OFF')
    const transaction = await client.transaction('write')
    try {
      const schema = await transaction.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
      )
      const targetTables = new Set(schema.rows.map((row) => String(row.name)))
      if (!targetTables.has('payload_migrations'))
        throw new Error('Run pnpm db:init against the target first')
      // Refuse to merge into any populated target, including tables absent from the dump.
      for (const name of targetTables) {
        if (name === 'payload_migrations') continue
        const count = await transaction.execute(
          `SELECT COUNT(*) AS n FROM ${quoteIdentifier(name)}`,
        )
        if (Number(count.rows[0].n)) throw new Error(`Target is not empty: ${name}`)
      }
      const report: { table: string; rows: number; sha256: string }[] = []
      for (const table of tables) {
        // PostgreSQL migration history is archived in the repository; SQLite has its own baseline.
        if (table.name === 'payload_migrations') continue
        if (!targetTables.has(table.name)) throw new Error(`No SQLite table for ${table.name}`)
        const columns = await transaction.execute(
          `PRAGMA table_info(${quoteIdentifier(table.name)})`,
        )
        const columnNames = new Set(columns.rows.map((row) => String(row.name)))
        for (const column of table.columns) {
          if (!columnNames.has(column.name))
            throw new Error(`No SQLite column for ${table.name}.${column.name}`)
        }
        const names = table.columns.map((column) => quoteIdentifier(column.name)).join(', ')
        const placeholders = table.columns.map(() => '?').join(', ')
        const expected = table.rows.map((row) =>
          row.map((value, i) => convertValue(value, table.columns[i].type)),
        )
        for (const values of expected) {
          await transaction.execute({
            sql: `INSERT INTO ${quoteIdentifier(table.name)} (${names}) VALUES (${placeholders})`,
            args: values,
          })
        }
        const actual = await transaction.execute(
          `SELECT ${names} FROM ${quoteIdentifier(table.name)}`,
        )
        const digest = rowsDigest(expected)
        if (
          actual.rows.length !== expected.length ||
          rowsDigest(actual.rows.map((row) => table.columns.map(({ name }) => row[name]))) !==
            digest
        ) {
          throw new Error(`Data verification failed: ${table.name}`)
        }
        report.push({ table: table.name, rows: expected.length, sha256: digest })
      }
      const foreignKeys = await transaction.execute('PRAGMA foreign_key_check')
      if (foreignKeys.rows.length) {
        throw new Error(
          `Foreign key check failed (${foreignKeys.rows.length} references); all imported data rolled back`,
        )
      }
      const integrity = await transaction.execute('PRAGMA integrity_check')
      if (integrity.rows[0]?.integrity_check !== 'ok')
        throw new Error('SQLite integrity check failed')
      // Keep PostgreSQL sequence high-water marks, including IDs deleted before backup.
      for (const owned of sql.matchAll(
        /^ALTER SEQUENCE public\.([a-z_0-9]+) OWNED BY public\.([a-z_0-9]+)\.id;$/gm,
      )) {
        const [, sequence, table] = owned
        if (table === 'payload_migrations') continue
        const sequenceValue = new RegExp(
          `^SELECT pg_catalog\\.setval\\('public\\.${sequence}', (\\d+), (true|false)\\);$`,
          'm',
        ).exec(sql)
        if (!sequenceValue) throw new Error(`Missing sequence value: ${table}`)
        const highWater = Number(sequenceValue[1]) - (sequenceValue[2] === 'true' ? 0 : 1)
        if (!Number.isSafeInteger(highWater)) throw new Error(`Unsafe sequence: ${table}`)
        const definition = await transaction.execute({
          sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?",
          args: [table],
        })
        if (String(definition.rows[0]?.sql).includes('AUTOINCREMENT')) {
          await transaction.execute({
            sql: 'INSERT INTO sqlite_sequence (name, seq) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM sqlite_sequence WHERE name = ?)',
            args: [table, highWater, table],
          })
          await transaction.execute({
            sql: 'UPDATE sqlite_sequence SET seq = MAX(seq, ?) WHERE name = ?',
            args: [highWater, table],
          })
        }
      }
      await transaction.commit()
      await client.execute('PRAGMA foreign_keys = ON')
      await client.execute('PRAGMA wal_checkpoint(TRUNCATE)')
      return report
    } finally {
      if (!transaction.closed) await transaction.rollback()
      transaction.close()
    }
  } finally {
    client.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [source, destination] = process.argv.slice(2)
  if (!source || !destination) {
    console.error('Usage: pnpm db:import <backup.sql[.gz]> <file:/absolute/path/xc2f.db>')
    process.exitCode = 1
  } else {
    try {
      const report = await importPostgresDump(source, destination)
      console.table(report.map(({ table, rows }) => ({ table, rows })))
      console.log(
        `Verified ${report.length} tables, ${report.reduce((n, t) => n + t.rows, 0)} rows; original backup unchanged.`,
      )
    } catch (error) {
      // Do not print row values, SQL bindings, hashes, or credentials on failures.
      console.error(error instanceof Error ? error.message.split('\n')[0] : 'Import failed')
      process.exitCode = 1
    }
  }
}
