import { sql, type SQLiteAdapter } from '@payloadcms/db-sqlite'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { Endpoint, PayloadRequest } from 'payload'

import { isAdminOrEditorUser } from '../../access/roles'
import type { Feed } from '../../payload-types'
import { getServerSideURL } from '../../utilities/getURL'

const headers = {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

const notFound = () => Response.json({ message: 'Feed not found' }, { status: 404, headers })
const forbidden = () => Response.json({ message: 'Forbidden' }, { status: 403, headers })
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
const db = (req: PayloadRequest) => req.payload.db.drizzle as SQLiteAdapter['drizzle']

function feedID(req: PayloadRequest) {
  const id = req.routeParams?.id
  if (typeof id !== 'string' || !/^\d+$/.test(id)) return null
  const parsed = Number(id)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function allowsSubscriptionChange(req: PayloadRequest) {
  if (!isAdminOrEditorUser(req.user) || req.headers.get('sec-fetch-site') === 'cross-site') {
    return false
  }

  const origin = req.headers.get('origin')
  return !origin || origin === new URL(getServerSideURL()).origin
}

function feedResponse(feed: Pick<Feed, 'body' | 'json'>, json: boolean) {
  if (json) return Response.json(feed.json ?? {}, { headers })
  return new Response(feed.body ?? '', {
    headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export const feedEndpoints: Endpoint[] = [
  {
    path: '/for/:slug',
    method: 'get',
    handler: async (req) => {
      const slug = req.routeParams?.slug
      if (typeof slug !== 'string' || !slug) return notFound()

      const { docs: [feed] } = await req.payload.find({
        collection: 'feeds',
        overrideAccess: false,
        req,
        where: {
          slug: { equals: slug },
          visibility: { equals: 'public' },
          _status: { equals: 'published' },
        },
        limit: 1,
        depth: 0,
      })

      return feed ? feedResponse(feed, req.query.json !== undefined) : notFound()
    },
  },
  {
    path: '/private/:token',
    method: 'get',
    handler: async (req) => {
      const token = req.routeParams?.token
      if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return notFound()

      // Check the credential and the current publication state in one read.
      const [feed] = await db(req).all<{ body: string | null; json: string | null }>(sql`
        SELECT feeds.body, feeds.json
        FROM feed_subscription_tokens AS tokens
        JOIN feeds ON feeds.id = tokens.feed_id
        WHERE tokens.token_hash = ${hashToken(token)}
          AND feeds.visibility = 'private' AND feeds._status = 'published'
      `)
      if (!feed) return notFound()
      if (req.query.json !== undefined) {
        return new Response(feed.json == null || feed.json === 'null' ? '{}' : feed.json, {
          headers: { ...headers, 'Content-Type': 'application/json' },
        })
      }
      return feedResponse({ body: feed.body }, false)
    },
  },
  {
    path: '/:id/subscriptions',
    method: 'get',
    handler: async (req) => {
      if (!isAdminOrEditorUser(req.user)) return forbidden()
      const id = feedID(req)
      if (id === null) return notFound()

      const subscriptions = await db(req).all<{ id: string; label: string }>(sql`
        SELECT id, label FROM feed_subscription_tokens
        WHERE feed_id = ${id}
        ORDER BY label, id
      `)
      return Response.json(subscriptions, { headers })
    },
  },
  {
    path: '/:id/subscriptions',
    method: 'post',
    handler: async (req) => {
      if (!allowsSubscriptionChange(req)) return forbidden()
      const id = feedID(req)
      if (id === null) return notFound()

      if (req.headers.get('content-type')?.split(';')[0] !== 'application/json') {
        return Response.json({ message: 'Expected JSON' }, { status: 415, headers })
      }
      const body: unknown = await req.json?.().catch(() => null)
      const label = body && typeof body === 'object' && 'label' in body && typeof body.label === 'string'
        ? body.label.trim()
        : ''
      if (!label || label.length > 120) {
        return Response.json({ message: 'Label must be 1–120 characters' }, { status: 400, headers })
      }

      const token = randomBytes(32).toString('base64url')
      const url = new URL(`/api/feeds/private/${token}`, getServerSideURL())
      const isLocal =
        process.env.NODE_ENV !== 'production' &&
        url.protocol === 'http:' &&
        url.hostname === 'localhost'
      if (url.protocol !== 'https:' && !isLocal) {
        return Response.json({ message: 'An HTTPS site URL is required' }, { status: 503, headers })
      }

      const [subscription] = await db(req).all<{ id: string; json: string | null }>(sql`
        INSERT INTO feed_subscription_tokens (id, feed_id, label, token_hash)
        SELECT ${randomUUID()}, feeds.id, ${label}, ${hashToken(token)}
        FROM feeds
        WHERE feeds.id = ${id} AND feeds.visibility = 'private' AND feeds._status = 'published'
        RETURNING id, (SELECT json FROM feeds WHERE id = ${id}) AS json
      `)
      if (!subscription) return notFound()
      if (subscription.json != null && subscription.json !== 'null') url.search = '?json'

      return Response.json({ id: subscription.id, label, url: url.href }, { status: 201, headers })
    },
  },
  {
    path: '/:id/subscriptions/:subscriptionID',
    method: 'delete',
    handler: async (req) => {
      if (!allowsSubscriptionChange(req)) return forbidden()
      const id = feedID(req)
      const subscriptionID = req.routeParams?.subscriptionID
      if (id === null || typeof subscriptionID !== 'string') return notFound()

      const result = await db(req).run(sql`
        DELETE FROM feed_subscription_tokens
        WHERE feed_id = ${id} AND id = ${subscriptionID}
      `)
      return result.rowsAffected ? new Response(null, { status: 204, headers }) : notFound()
    },
  },
]
