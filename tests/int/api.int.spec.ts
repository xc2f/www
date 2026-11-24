import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})

describe('Moments slug generation', () => {
  const createdIds: (number | string)[] = []

  beforeAll(async () => {
    if (!payload) {
      const payloadConfig = await config
      payload = await getPayload({ config: payloadConfig })
    }
  })

  afterAll(async () => {
    for (const id of createdIds) {
      await payload.delete({ collection: 'moments', id })
    }
  })

  it('generates a slug when the moment has no title', async () => {
    const moment = await payload.create({
      collection: 'moments',
      data: { mood: 'happy' },
      draft: true,
      context: { skipTranslation: true },
    })
    createdIds.push(moment.id)

    expect(moment.slug).toMatch(/^\d{8}-\d{6}(-[0-9a-f]{6})?$/)
  })

  it('generates a unique slug for titles that slugify to nothing', async () => {
    const first = await payload.create({
      collection: 'moments',
      data: { title: '今天很开心' },
      draft: true,
      context: { skipTranslation: true },
    })
    const second = await payload.create({
      collection: 'moments',
      data: { title: '今天很开心' },
      draft: true,
      context: { skipTranslation: true },
    })
    createdIds.push(first.id, second.id)

    expect(first.slug).toMatch(/^\d{8}-\d{6}(-[0-9a-f]{6})?$/)
    expect(second.slug).toBeTruthy()
    expect(second.slug).not.toBe(first.slug)
  })

  it('keeps title-derived and manual slugs', async () => {
    const titled = await payload.create({
      collection: 'moments',
      data: { title: 'Hello World' },
      draft: true,
      context: { skipTranslation: true },
    })
    const manual = await payload.create({
      collection: 'moments',
      data: { title: 'Manual', slug: 'my-slug' },
      draft: true,
      context: { skipTranslation: true },
    })
    createdIds.push(titled.id, manual.id)

    expect(titled.slug).toBe('hello-world')
    expect(manual.slug).toBe('my-slug')
  })
})
