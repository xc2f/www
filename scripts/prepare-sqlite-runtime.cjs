const assert = require('node:assert/strict')
const fs = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')

const output = path.resolve('.next/standalone')
if (!fs.existsSync(output)) process.exit(0)

function packageRoot(requireFrom, name) {
  // Read installed manifests directly: @libsql/core exports subpaths, but no root entry.
  for (const directory of requireFrom.resolve.paths(name) || []) {
    const manifest = path.join(directory, name, 'package.json')
    if (fs.existsSync(manifest) && JSON.parse(fs.readFileSync(manifest)).name === name) {
      return fs.realpathSync(path.dirname(manifest))
    }
  }
  throw Object.assign(new Error(`Cannot locate installed package: ${name}`), {
    code: 'MODULE_NOT_FOUND',
  })
}

const source = packageRoot(require, '@libsql/client')
const version = JSON.parse(fs.readFileSync(path.join(source, 'package.json'))).version
const destinations = new Set()

function findClients(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue // Do not follow links back into source dependencies.
    const child = path.join(directory, entry.name)
    if (entry.name === 'client' && path.basename(directory) === '@libsql') {
      const manifest = path.join(child, 'package.json')
      if (fs.existsSync(manifest)) {
        const data = JSON.parse(fs.readFileSync(manifest))
        assert.equal(data.version, version, 'Unexpected libSQL client version in standalone output')
        destinations.add(child)
      }
    } else findClients(child)
  }
}
findClients(path.join(output, 'node_modules'))
assert.ok(destinations.size, 'Standalone output is missing @libsql/client')

function copyPackage(source, destination, ancestors = new Map()) {
  source = fs.realpathSync(source)
  if (ancestors.has(source)) {
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.symlinkSync(
      path.relative(path.dirname(destination), ancestors.get(source)),
      destination,
      'dir',
    )
    return
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(source, 'package.json')))
  fs.cpSync(source, destination, {
    recursive: true,
    dereference: true,
    // Reconstruct installed dependencies without pnpm links to the source tree.
    filter: (filename) => filename !== path.join(source, 'node_modules'),
  })
  const nextAncestors = new Map(ancestors).set(source, destination)
  const requireFrom = createRequire(path.join(source, 'package.json'))
  const optional = manifest.optionalDependencies || {}
  for (const name of Object.keys({ ...manifest.dependencies, ...optional })) {
    let dependency
    try {
      dependency = packageRoot(requireFrom, name)
    } catch (error) {
      if (name in optional && error.code === 'MODULE_NOT_FOUND') continue
      throw error
    }
    copyPackage(dependency, path.join(destination, 'node_modules', name), nextAncestors)
  }
}

for (const destination of destinations) {
  assert.ok(destination.startsWith(output + path.sep))
  fs.rmSync(destination, { recursive: true, force: true })
  copyPackage(source, destination)
}
console.log(
  `Prepared full SQLite client runtime (${destinations.size} package location(s), ${process.platform}/${process.arch}).`,
)
