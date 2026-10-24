const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { tmpdir } = require('node:os')
const { pathToFileURL } = require('node:url')

// Test ESM and CommonJS from the artifact itself; source dependencies must not mask omissions.
const root = path.resolve(process.argv[2] || process.cwd())
const clients = []
function findClients(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const child = path.join(directory, entry.name)
    if (entry.name === 'client' && path.basename(directory) === '@libsql') {
      if (fs.existsSync(path.join(child, 'package.json'))) clients.push(child)
    } else findClients(child)
  }
}
findClients(path.join(root, 'node_modules'))
assert.ok(clients.length, 'Standalone output is missing @libsql/client')

async function check(createClient) {
  const directory = fs.mkdtempSync(path.join(tmpdir(), 'xc2f-sqlite-check-'))
  const db = createClient({ url: pathToFileURL(path.join(directory, 'test.db')).href })
  try {
    await db.execute('CREATE TABLE smoke (value INTEGER, bytes BLOB)')
    await db.execute({
      sql: 'INSERT INTO smoke VALUES (?, ?)',
      args: [42, new Uint8Array([0, 255])],
    })
    const result = await db.execute('SELECT value, bytes FROM smoke')
    assert.equal(result.rows[0].value, 42)
    assert.equal(result.toJSON().rows[0][1], 'AP8=')
    const transaction = await db.transaction('write')
    await transaction.execute('INSERT INTO smoke (value) VALUES (99)')
    await transaction.rollback()
    assert.equal((await db.execute('SELECT COUNT(*) AS n FROM smoke')).rows[0].n, 1)
  } finally {
    db.close()
    fs.rmSync(directory, { recursive: true, force: true })
  }
}

async function main() {
  for (const client of clients) {
    await check(
      (await import(pathToFileURL(path.join(client, 'lib-esm/node.js')).href)).createClient,
    )
    await check(require(path.join(client, 'lib-cjs/node.js')).createClient)
  }
  console.log(
    `SQLite ESM/CommonJS client, native binding, base64 and transactions verified: ${process.platform}/${process.arch}`,
  )
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
