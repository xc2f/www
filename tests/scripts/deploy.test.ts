import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { test } from 'node:test'

const execFileAsync = promisify(execFile)

// Simulate the Docker boundary; never touch the host Docker daemon or database.
async function simulateDeployment(scenario: string) {
  const directory = await mkdtemp(path.join(tmpdir(), 'xc2f-deploy-test-'))
  try {
    const bin = path.join(directory, 'bin')
    await mkdir(bin)
    await copyFile(
      new URL('../../scripts/deploy.sh', import.meta.url),
      path.join(directory, 'deploy.sh'),
    )
    await writeFile(path.join(directory, 'docker-compose.prod.yml'), 'services: {}\n')
    await writeFile(
      path.join(directory, 'state.json'),
      JSON.stringify({ current: 'old', calls: [] }),
    )
    const shim = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(process.env.DEPLOY_TEST_DIR, 'state.json');
const state = JSON.parse(fs.readFileSync(file, 'utf8'));
const tool = path.basename(process.argv[1]);
const args = process.argv.slice(2);
state.calls.push([tool, ...args]);
const scenario = process.env.DEPLOY_TEST_SCENARIO;
let code = 0;
if (tool === 'docker' && args[0] === 'inspect') {
  if (scenario === 'first-install') code = 1;
  else process.stdout.write('sha256:previous-image\\n');
}
if (tool === 'docker' && args[0] === 'compose') {
  if (args.includes('run') && scenario === 'preflight-failed') code = 1;
  if (args.includes('up')) state.current = args.filter(arg => arg === '-f').length > 1 ? 'old' : 'new';
  if (args.includes('exec') && state.current === 'new' && ['unhealthy', 'first-install'].includes(scenario)) code = 1;
}
fs.writeFileSync(file, JSON.stringify(state));
process.exit(code);
`
    for (const command of ['docker', 'sleep']) {
      await writeFile(path.join(bin, command), shim, { mode: 0o755 })
    }
    let exitCode = 0
    let output = ''
    try {
      output = (
        await execFileAsync('bash', [path.join(directory, 'deploy.sh')], {
          env: {
            ...process.env,
            PATH: `${bin}:${process.env.PATH}`,
            DEPLOY_TEST_DIR: directory,
            DEPLOY_TEST_SCENARIO: scenario,
          },
        })
      ).stdout
    } catch (error) {
      const failure = error as { code: number; stdout: string }
      exitCode = failure.code
      output = failure.stdout
    }
    const state = JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')) as {
      current: string
      calls: string[][]
    }
    await assert.rejects(readFile(path.join(directory, '.deploy.lock')), { code: 'ENOENT' })
    return { ...state, exitCode, output }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test('deployment waits for database readiness and preserves a rollback image', async () => {
  const result = await simulateDeployment('healthy')
  assert.equal(result.exitCode, 0)
  assert.equal(result.current, 'new')
  assert.ok(
    result.calls.some((call) => call.includes('tag') && call.includes('sha256:previous-image')),
  )
  assert.ok(result.calls.some((call) => call.includes('exec') && call.includes('/api/health')))
  assert.equal(
    result.calls.some((call) => call.includes('down')),
    false,
  )
})

test('failed readiness restores the previous image and still exits unsuccessfully', async () => {
  const result = await simulateDeployment('unhealthy')
  assert.equal(result.exitCode, 1)
  assert.equal(result.current, 'old')
  assert.ok(result.output.includes('Previous image restored'))
  assert.ok(result.calls.some((call) => call.includes('/admin/login')))
  assert.equal(result.calls.filter((call) => call.includes('stop')).length, 2)
  assert.equal(
    result.calls.some((call) => call.includes('prune')),
    false,
  )
})

test('failed preflight leaves the current application running', async () => {
  const result = await simulateDeployment('preflight-failed')
  assert.equal(result.exitCode, 1)
  assert.equal(result.current, 'old')
  assert.equal(
    result.calls.some((call) => call.includes('stop') || call.includes('up')),
    false,
  )
})

test('failed first deployment reports failure without inventing a rollback image', async () => {
  const result = await simulateDeployment('first-install')
  assert.equal(result.exitCode, 1)
  assert.equal(result.calls.filter((call) => call.includes('up')).length, 1)
  assert.equal(result.output.includes('Previous image restored'), false)
})
