import { execFile } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { promisify } from 'node:util'
import { createGzip } from 'node:zlib'
import { sqliteFilePath } from './sqlite'

const execFileAsync = promisify(execFile)

export const createSqliteSnapshot = async (
  url: string,
  snapshotPath: string,
  gzipPath: string,
  signal?: AbortSignal,
) => {
  // VACUUM INTO includes committed WAL data and takes a consistent online snapshot.
  // -readonly prevents a bad source path from creating an empty database.
  await execFileAsync(
    'sqlite3',
    [
      '-readonly',
      sqliteFilePath(url),
      '.timeout 30000',
      `VACUUM INTO '${snapshotPath.replaceAll("'", "''")}';`,
    ],
    { signal, killSignal: 'SIGKILL' },
  )
  await pipeline(
    createReadStream(snapshotPath),
    createGzip(),
    createWriteStream(gzipPath, { flags: 'wx', mode: 0o600 }),
    { signal },
  )
}
