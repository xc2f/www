import { createHash } from 'node:crypto'

export type DumpTable = {
  name: string
  columns: { name: string; type: string }[]
  rows: (string | null)[][]
}

export const quoteIdentifier = (name: string): string => `"${name.replaceAll('"', '""')}"`

/** Decode PostgreSQL COPY text, not SQL strings. Never execute statements from a dump. */
export const decodeCopy = (value: string): string | null => {
  if (value === '\\N') return null
  const escapes: Record<string, string> = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
    '\\': '\\',
  }
  return value.replace(/\\([0-7]{1,3}|x[0-9a-fA-F]{1,2}|[^\n])/g, (_, code: string) => {
    if (/^[0-7]/.test(code)) return String.fromCharCode(parseInt(code, 8))
    if (code.startsWith('x') && code.length > 1)
      return String.fromCharCode(parseInt(code.slice(1), 16))
    return escapes[code] ?? code
  })
}

/** Deliberately limited to the public-schema COPY format emitted by this project's pg_dump. */
export const parseDump = (sql: string): DumpTable[] => {
  if (/^INSERT INTO /m.test(sql))
    throw new Error('Use a default pg_dump with COPY data, not --inserts')
  if (!/^-- PostgreSQL database dump complete/m.test(sql))
    throw new Error('Incomplete pg_dump backup')
  if (!/^SET client_encoding = 'UTF8';/m.test(sql))
    throw new Error('Only UTF8 backups are supported')
  const schemas = new Map<string, Map<string, string>>()
  for (const match of sql.matchAll(
    /^CREATE TABLE public\.([a-z_][a-z_0-9]*) \(\n([\s\S]*?)^\);/gm,
  )) {
    const columns = new Map<string, string>()
    for (const line of match[2].trimEnd().split('\n')) {
      const column = /^ {4}("[^"]+"|[a-z_][a-z_0-9]*) (.+?)(?:,$|$)/.exec(line)
      if (!column) throw new Error(`Unsupported table definition: ${match[1]}`)
      columns.set(column[1].replaceAll('"', ''), column[2])
    }
    schemas.set(match[1], columns)
  }
  const tables: DumpTable[] = []
  for (const match of sql.matchAll(
    /^COPY public\.([a-z_][a-z_0-9]*) \(([^\n]+)\) FROM stdin;\n([\s\S]*?)^\\\.$/gm,
  )) {
    const name = match[1]
    if (tables.some((table) => table.name === name)) throw new Error(`Duplicate table: ${name}`)
    const schema = schemas.get(name)
    if (!schema) throw new Error(`Missing schema for ${name}`)
    const columns = match[2].split(', ').map((column) => {
      const name = column.replaceAll('"', '')
      const type = schema.get(name)
      if (!type) throw new Error(`Unknown column: ${name}`)
      return { name, type }
    })
    const lines = match[3] ? match[3].slice(0, -1).split('\n') : []
    const rows = lines.map((line) => {
      const values = line.split('\t').map(decodeCopy)
      if (values.length !== columns.length) throw new Error(`Invalid COPY row in ${name}`)
      return values
    })
    tables.push({ name, columns, rows })
  }
  const copyCount = [...sql.matchAll(/^COPY /gm)].length
  if (!tables.length || tables.length !== copyCount || tables.length !== schemas.size) {
    throw new Error('Unsupported or incomplete COPY data; refusing a partial import')
  }
  return tables
}

export const convertValue = (value: string | null, type: string): string | number | null => {
  if (value === null) return null
  if (/^boolean\b/.test(type)) {
    if (value !== 't' && value !== 'f') throw new Error('Invalid boolean')
    return value === 't' ? 1 : 0
  }
  if (/^(integer|smallint|bigint|numeric|real|double precision)\b/.test(type)) {
    const number = Number(value)
    const canonicalNumber = (text: string): string => {
      const match = /^([+-]?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(text)
      if (!match) throw new Error('Invalid numeric value')
      const digits = (match[2] + (match[3] || '')).replace(/^0+/, '')
      if (!digits) return '0'
      const significant = digits.replace(/0+$/, '')
      const exponent =
        Number(match[4] || 0) - (match[3]?.length || 0) + digits.length - significant.length
      return `${match[1] === '-' ? '-' : ''}${significant}e${exponent}`
    }
    if (!Number.isFinite(number) || (Number.isInteger(number) && !Number.isSafeInteger(number))) {
      throw new Error('Numeric value cannot be represented safely')
    }
    if (canonicalNumber(value) !== canonicalNumber(String(number))) {
      throw new Error('Numeric precision would be lost')
    }
    return number
  }
  if (/^timestamp\b/.test(type)) {
    const date = new Date(/with time zone/.test(type) ? value : `${value}Z`)
    if (!Number.isFinite(date.getTime())) throw new Error('Invalid timestamp')
    // Payload schema uses millisecond precision; never silently truncate finer timestamps.
    if (/\.\d{3}[1-9]|\.\d{4,}/.test(value))
      throw new Error('Sub-millisecond timestamp is unsupported')
    return date.toISOString()
  }
  if (/^(jsonb?|text|character varying|public\.enum_[a-z_0-9]+|public\._locales)\b/.test(type))
    return value
  throw new Error(`Unsupported PostgreSQL type: ${type}`)
}

/** Multiset digest checks every field while allowing different physical row order. */
export const rowsDigest = (rows: unknown[][]): string => {
  const hashes = rows
    .map((row) => createHash('sha256').update(JSON.stringify(row)).digest('hex'))
    .sort()
  return createHash('sha256').update(hashes.join('\n')).digest('hex')
}
