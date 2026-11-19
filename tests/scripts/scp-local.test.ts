import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('local SCP supports uploads and downloads without contacting a real server', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'xc2f-scp-test-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const reservation = createServer().listen(0, '127.0.0.1')
  await once(reservation, 'listening')
  const { port } = reservation.address() as { port: number }
  await new Promise<void>((resolve) => reservation.close(() => resolve()))

  const serverSource = await readFile(
    new URL('../../scripts/scp-local/server.ts', import.meta.url),
    'utf8',
  )
  await writeFile(join(directory, 'server.ts'), serverSource.replaceAll('4762', String(port)))
  for (const asset of ['index.html', 'page.js', 'style.css']) {
    await copyFile(
      new URL(`../../scripts/scp-local/${asset}`, import.meta.url),
      join(directory, asset),
    )
  }
  const bin = join(directory, 'bin')
  const target = join(directory, 'local folder')
  const key = join(directory, 'key.pem')
  const log = join(directory, 'args.json')
  await mkdir(bin)
  await mkdir(target)
  await writeFile(key, 'test key')
  // Inspect the process boundary; credentials never reach a real SSH server.
  await writeFile(
    join(bin, 'scp'),
    `#!${process.execPath}
require('node:fs').writeFileSync(process.env.SCP_TEST_LOG, JSON.stringify(process.argv.slice(2)))
`,
    { mode: 0o755 },
  )
  const server = spawn(process.execPath, [join(directory, 'server.ts')], {
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, SCP_TEST_LOG: log },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  t.after(async () => {
    if (server.exitCode === null) {
      server.kill('SIGTERM')
      await once(server, 'close')
    }
  })
  await Promise.race([
    once(server.stdout, 'data'),
    once(server, 'exit').then(([code]) => {
      throw new Error(`SCP test server exited: ${code}`)
    }),
  ])
  const origin = `http://127.0.0.1:${port}`
  const defaults = {
    source: target,
    destination: '/remote/folder with spaces',
    host: '::1',
    port: '2222',
    user: 'ubuntu',
    auth: 'pem',
    key,
    secret: '',
  }
  const transfer = async (overrides: Record<string, unknown>) => {
    await rm(log, { force: true })
    const response = await fetch(`${origin}/transfer`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...defaults, ...overrides }),
    })
    const result = (await response.json()) as { message: string }
    const args: string[] = await readFile(log, 'utf8')
      .then((data) => JSON.parse(data) as string[])
      .catch(() => [])
    return { status: response.status, message: result.message, args }
  }

  await t.test('downloads a file with remote source first and no recursion', async () => {
    const result = await transfer({ direction: 'download', remoteType: 'file' })
    assert.equal(result.status, 200, result.message)
    assert.deepEqual(result.args.slice(-3), [
      '--',
      'ubuntu@[::1]:/remote/folder with spaces',
      target,
    ])
    assert.equal(result.args.includes('-r'), false)
    assert.ok(result.args.includes('-s'))
    assert.ok(result.args.includes('StrictHostKeyChecking=yes'))
    assert.equal(result.args[result.args.indexOf('-P') + 1], '2222')
    assert.equal(result.args[result.args.indexOf('-i') + 1], key)
  })
  await t.test('downloads directories recursively with password authentication', async () => {
    const result = await transfer({
      direction: 'download',
      remoteType: 'directory',
      auth: 'password',
      secret: 'test-password',
    })
    assert.equal(result.status, 200, result.message)
    assert.ok(result.args.includes('-r'))
    assert.ok(result.args.includes('PreferredAuthentications=password'))
    assert.equal(result.args.includes('test-password'), false)
  })
  await t.test('preserves legacy uploads and recursive directory uploads', async () => {
    for (const direction of [undefined, 'upload']) {
      const result = await transfer({ direction })
      assert.equal(result.status, 200, result.message)
      assert.deepEqual(result.args.slice(-3), [
        '--',
        target,
        'ubuntu@[::1]:/remote/folder with spaces/',
      ])
      assert.ok(result.args.includes('-r'))
    }
    const result = await transfer({ source: key })
    assert.equal(result.status, 200, result.message)
    assert.equal(result.args.includes('-r'), false)
  })
  await t.test('rejects invalid downloads before launching SCP', async () => {
    for (const overrides of [
      { source: key },
      { source: join(directory, 'missing') },
      { destination: 'relative/path' },
      { remoteType: 'unknown' },
      { direction: 'unknown' },
      { remoteType: undefined },
    ]) {
      const result = await transfer({ direction: 'download', remoteType: 'file', ...overrides })
      assert.equal(result.status, 400, result.message)
      assert.deepEqual(result.args, [])
    }
  })
})
