import { createClient } from '@libsql/client'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { sqliteFilePath } from '../../src/utilities/sqlite'
import { convertValue, parseDump, quoteIdentifier, rowsDigest } from './pg-dump'

export const verifyPostgresDump = async (source: string, destination: string) => {
  const filename = sqliteFilePath(destination)
  await stat(filename)
  const backup = await readFile(source)
  const tables = parseDump((source.endsWith('.gz') ? gunzipSync(backup) : backup).toString('utf8'))
  const client = createClient({ url: pathToFileURL(filename).href })
  try {
    const report = []
    for (const table of tables) {
      if (table.name === 'payload_migrations') continue
      const names = table.columns.map(({ name }) => quoteIdentifier(name)).join(', ')
      const actual = await client.execute(`SELECT ${names} FROM ${quoteIdentifier(table.name)}`)
      const expected = table.rows.map((row) =>
        row.map((value, i) => convertValue(value, table.columns[i].type)),
      )
      const digest = rowsDigest(expected)
      if (
        actual.rows.length !== expected.length ||
        rowsDigest(actual.rows.map((row) => table.columns.map(({ name }) => row[name]))) !== digest
      ) {
        throw new Error(`Data verification failed: ${table.name}`)
      }
      report.push({ table: table.name, rows: expected.length, sha256: digest })
    }
    if ((await client.execute('PRAGMA foreign_key_check')).rows.length)
      throw new Error('Foreign key check failed')
    if ((await client.execute('PRAGMA integrity_check')).rows[0].integrity_check !== 'ok')
      throw new Error('Integrity check failed')
    return {
      backupSha256: createHash('sha256').update(backup).digest('hex'),
      verifiedAt: new Date().toISOString(),
      tableCount: report.length,
      rowCount: report.reduce((n, table) => n + table.rows, 0),
      tables: report,
    }
  } finally {
    client.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [source, destination] = process.argv.slice(2)
  if (!source || !destination) {
    console.error('Usage: pnpm db:verify <backup.sql[.gz]> <file:/absolute/path/xc2f.db>')
    process.exitCode = 1
  } else {
    try {
      console.log(JSON.stringify(await verifyPostgresDump(source, destination), null, 2))
    } catch {
      console.error('Database verification failed; no data changed.')
      process.exitCode = 1
    }
  }
}
