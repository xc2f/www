const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

// Run inside the assembled standalone output/image so source dependencies cannot mask omissions.
const store = path.resolve(process.argv[2] || process.cwd(), 'node_modules/.pnpm')
const drivers = fs
  .readdirSync(store)
  .filter((name) => name.startsWith('libsql@'))
  .map((name) => path.join(store, name, 'node_modules/libsql/index.js'))
  .filter((filename) => fs.existsSync(filename))
assert.ok(drivers.length, 'Standalone output is missing the libsql driver')

for (const driver of drivers) {
  const Database = require(driver)
  const db = new Database(':memory:')
  try {
    db.exec('CREATE TABLE smoke (value INTEGER); INSERT INTO smoke VALUES (42)')
    assert.equal(db.prepare('SELECT value FROM smoke').get().value, 42)
  } finally {
    db.close()
  }
}

console.log(`SQLite native runtime verified: ${process.platform}/${process.arch}`)
