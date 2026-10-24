import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Local files only: runtime, backup, and migration must refer to the same database. */
export const sqliteFilePath = (url: string): string => {
  if (
    !url.startsWith('file:') ||
    url === 'file::memory:' ||
    url.includes('?') ||
    url.includes('#')
  ) {
    throw new Error('DATABASE_URL must be a local SQLite file URL, e.g. file:/app/data/xc2f.db')
  }

  const filename = url.startsWith('file://') ? fileURLToPath(url) : url.slice(5)
  if (!filename) throw new Error('SQLite database filename is required')
  return path.resolve(filename)
}

export const sqliteURL = (): string => {
  const url = process.env.DATABASE_URL || 'file:./data/xc2f.db'
  sqliteFilePath(url)
  return url
}
