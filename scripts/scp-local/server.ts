import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { createServer, type IncomingMessage } from 'node:http'
import { isIP } from 'node:net'
import { homedir, tmpdir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'

const address = '127.0.0.1:4762'
const origin = `http://${address}`
const maxBodyBytes = 32 * 1024
let busy = false
let pickerOpen = false

const run = promisify(execFile)
const pickerCommands = {
  file: 'choose file with prompt "选择要传输的文件"',
  directory: 'choose folder with prompt "选择要传输的目录"',
  pem: 'choose file with prompt "选择 PEM 私钥文件"',
}

class InputError extends Error {}

async function pickPath(kind: unknown, signal: AbortSignal) {
  if (kind !== 'file' && kind !== 'directory' && kind !== 'pem') {
    throw new InputError('无效的选择类型。')
  }
  if (process.platform !== 'darwin') {
    throw new InputError('当前系统请直接填写本机路径。')
  }

  try {
    const { stdout } = await run(
      '/usr/bin/osascript',
      [
        '-e',
        'use scripting additions',
        '-e',
        'activate',
        '-e',
        `POSIX path of (${pickerCommands[kind]})`,
      ],
      { signal },
    )
    const path = stdout.replace(/\n$/, '')
    if (!isAbsolute(path) || /[\x00-\x1f\x7f]/.test(path)) {
      throw new InputError('所选路径含有无法传输的字符。')
    }
    return path
  } catch (error) {
    if (error instanceof InputError || signal.aborted) throw error
    if (/\(-128\)/.test(String((error as { stderr?: string }).stderr))) return null
    throw new InputError('无法打开 macOS 文件选择器，请直接填写本机路径。')
  }
}

function inputText(body: Record<string, unknown>, field: string) {
  const value = body[field]
  if (typeof value !== 'string' || /[\x00-\x1f\x7f]/.test(value)) {
    throw new InputError('输入含有无效字符。')
  }
  return value
}

function localPath(path: string) {
  const expanded = path.startsWith('~/') ? join(homedir(), path.slice(2)) : path
  if (!isAbsolute(expanded)) throw new InputError('本机路径须以 / 或 ~/ 开头。')
  return resolve(expanded)
}

async function readForm(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    size += chunk.length
    if (size > maxBodyBytes) {
      request.resume()
      throw new InputError('表单超出大小限制。')
    }
    chunks.push(chunk)
  }

  try {
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as Record<string, unknown>
    }
  } catch {
    throw new InputError('无法读取表单。')
  }
  throw new InputError('无法读取表单。')
}

async function transfer(body: Record<string, unknown>, signal: AbortSignal) {
  const host = inputText(body, 'host')
    .trim()
    .replace(/^\[(.*)\]$/, '$1')
  const port = inputText(body, 'port')
  const user = inputText(body, 'user').trim()
  const destination = inputText(body, 'destination')
  const source = localPath(inputText(body, 'source'))
  const auth = inputText(body, 'auth')
  const secret = inputText(body, 'secret')

  if (!isIP(host) && !/^[a-z\d](?:[a-z\d.-]{0,251}[a-z\d.])?$/i.test(host)) {
    throw new InputError('请输入有效的主机名或 IP 地址。')
  }
  if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new InputError('端口必须介于 1 和 65535 之间。')
  }
  if (!/^[a-z\d_][a-z\d_.-]*$/i.test(user)) {
    throw new InputError('请输入有效的 SSH 用户名。')
  }
  if (!destination.startsWith('/')) {
    throw new InputError('服务器目录须填写以 / 开头的绝对路径。')
  }
  if (auth !== 'password' && auth !== 'pem') throw new InputError('请选择认证方式。')
  if (auth === 'password' && !secret) throw new InputError('请输入 SSH 密码。')

  const sourceInfo = await stat(source).catch(() => null)
  if (!sourceInfo || (!sourceInfo.isFile() && !sourceInfo.isDirectory())) {
    throw new InputError('本机路径须指向可访问的文件或目录。')
  }

  const args = [
    '-s',
    '-F',
    '/dev/null',
    '-P',
    String(Number(port)),
    '-o',
    'StrictHostKeyChecking=yes',
    '-o',
    'ConnectTimeout=15',
    '-o',
    'ServerAliveInterval=15',
    '-o',
    'ServerAliveCountMax=3',
    '-o',
    'NumberOfPasswordPrompts=1',
    '-o',
    'IdentityAgent=none',
  ]
  if (sourceInfo.isDirectory()) args.push('-r')
  if (auth === 'pem') {
    const key = localPath(inputText(body, 'key'))
    if (!(await stat(key).catch(() => null))?.isFile()) {
      throw new InputError('PEM 路径须指向可访问的私钥文件。')
    }
    args.push('-i', key, '-o', 'IdentitiesOnly=yes', '-o', 'PreferredAuthentications=publickey')
  } else {
    args.push('-o', 'PreferredAuthentications=password', '-o', 'PubkeyAuthentication=no')
  }
  if (!secret) args.push('-B')

  const remoteHost = isIP(host) === 6 ? `[${host}]` : host
  args.push('--', source, `${user}@${remoteHost}:${destination.replace(/\/+$/, '')}/`)

  const env = { ...process.env, SSH_ASKPASS_REQUIRE: 'never', LC_ALL: 'C' }
  const temporary = secret ? await mkdtemp(join(tmpdir(), 'xc2f-scp-')) : undefined
  try {
    if (temporary) {
      const helper = join(temporary, 'askpass')
      await writeFile(helper, '#!/bin/sh\nprintf "%s\\n" "$XC2F_SCP_SECRET"\n', { mode: 0o700 })
      Object.assign(env, {
        SSH_ASKPASS: helper,
        SSH_ASKPASS_REQUIRE: 'force',
        XC2F_SCP_SECRET: secret,
      })
    }
    signal.throwIfAborted()
    await new Promise<void>((complete, fail) => {
      const child = spawn('scp', args, { env, stdio: ['ignore', 'ignore', 'pipe'], detached: true })
      let stderr = ''
      let launchError: Error | undefined
      const stop = () => {
        if (child.pid) {
          try {
            process.kill(-child.pid, 'SIGTERM')
          } catch {
            // The child may have already exited.
          }
        }
      }
      signal.addEventListener('abort', stop, { once: true })
      child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
        stderr = (stderr + chunk).slice(-8192)
      })
      child.on('error', (error) => {
        launchError = error
      })
      child.once('close', (code) => {
        signal.removeEventListener('abort', stop)
        if (signal.aborted) return fail(signal.reason)
        if (launchError) return fail(new InputError('无法运行 scp，请确认已安装 OpenSSH 客户端。'))
        if (code === 0) return complete()
        const detail = secret ? stderr.replaceAll(secret, '[已隐藏]') : stderr
        fail(new InputError(detail.trim() || `scp 退出，状态码 ${code ?? '未知'}。`))
      })
    })
  } finally {
    if (temporary) await rm(temporary, { recursive: true, force: true })
  }
}

const assets = new Map(
  await Promise.all(
    [
      ['/', 'index.html', 'text/html'],
      ['/style.css', 'style.css', 'text/css'],
      ['/page.js', 'page.js', 'text/javascript'],
    ].map(
      async ([path, name, type]) =>
        [path, { type, data: await readFile(new URL(name, import.meta.url)) }] as const,
    ),
  ),
)

const shutdown = new AbortController()
const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  )

  if (req.headers.host !== address) {
    res.writeHead(403).end()
    return
  }

  const asset = assets.get(req.url ?? '')
  if (req.method === 'GET' && asset) {
    res.writeHead(200, { 'Content-Type': `${asset.type}; charset=utf-8` }).end(asset.data)
    return
  }
  const isPicker = req.url === '/pick-path'
  if (req.method !== 'POST' || (req.url !== '/transfer' && !isPicker)) {
    res.writeHead(404).end()
    return
  }

  const reply = (status: number, message: string, path?: string | null) => {
    if (res.destroyed) return
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ message, path }))
  }

  if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json') {
    reply(403, '请从本机的 SCP 页面操作。')
    return
  }
  if (busy) {
    reply(409, '已有传输正在进行。')
    return
  }

  const disconnect = new AbortController()
  res.once('close', () => disconnect.abort())
  const signal = AbortSignal.any([disconnect.signal, shutdown.signal])

  if (isPicker) {
    if (pickerOpen) {
      reply(409, '已有文件选择窗口打开。')
      return
    }
    pickerOpen = true
    try {
      const form = await readForm(req)
      reply(200, '', await pickPath(form.kind, signal))
    } catch (error) {
      reply(
        error instanceof InputError ? 400 : 500,
        error instanceof InputError ? error.message : '选择窗口已关闭。',
      )
    } finally {
      pickerOpen = false
    }
    return
  }

  busy = true
  try {
    await transfer(await readForm(req), signal)
    reply(200, '传输完成。')
  } catch (error) {
    reply(
      error instanceof InputError ? 400 : 500,
      error instanceof InputError ? error.message : '传输中断，请检查本机服务后重试。',
    )
  } finally {
    busy = false
  }
})

for (const event of ['SIGINT', 'SIGTERM'] as const) {
  process.once(event, () => {
    shutdown.abort()
    server.close()
  })
}

server.listen(4762, '127.0.0.1', () => console.log(`SCP 文件传输  ${origin}`))
