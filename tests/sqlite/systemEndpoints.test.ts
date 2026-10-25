import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { PayloadRequest } from 'payload'
import { systemAccess } from '../../src/access/system'
import { endpoints } from '../../src/endpoints'

test('system access denies editors and missing cron secrets', async () => {
  const previousSecret = process.env.CRON_SECRET
  const req = (roles?: string[], token?: string) =>
    ({
      user: roles ? { id: 1, roles } : null,
      headers: new Headers(token ? { authorization: token } : {}),
    }) as PayloadRequest
  try {
    delete process.env.CRON_SECRET
    assert.equal(await systemAccess({ req: req(undefined, 'Bearer undefined') }), false)
    assert.equal(await systemAccess({ req: req(['editor']) }), false)
    assert.equal(await systemAccess({ req: req(['admin']) }), true)
    process.env.CRON_SECRET = ''
    assert.equal(await systemAccess({ req: req(undefined, 'Bearer ') }), false)
    process.env.CRON_SECRET = 'test-cron-secret'
    assert.equal(await systemAccess({ req: req(undefined, 'Bearer wrong') }), false)
    assert.equal(await systemAccess({ req: req(undefined, 'Bearer test-cron-secret') }), true)
    for (const path of ['/backup/database', '/backup/status']) {
      const response = await endpoints
        .find((endpoint) => endpoint.path === path)!
        .handler(req(['editor']))
      assert.equal(response.status, 401)
    }
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previousSecret
  }
})

test('readiness returns 503 when the initialized database cannot be queried', async () => {
  const handler = endpoints.find((endpoint) => endpoint.path === '/health')!.handler
  const req = {
    payload: {
      count: async () => {
        throw new Error('private database error')
      },
    },
  } as unknown as PayloadRequest
  const unavailable = await handler(req)
  assert.equal(unavailable.status, 503)
  assert.equal((await unavailable.text()).includes('private database error'), false)
  req.payload.count = async () => ({ totalDocs: 0 })
  const healthy = await handler(req)
  assert.equal(healthy.status, 200)
  assert.equal(healthy.headers.get('cache-control'), 'no-store')
})
