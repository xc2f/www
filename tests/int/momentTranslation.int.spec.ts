import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  applyMomentTexts,
  collectMomentTexts,
  requestMomentTranslation,
} from '@/utilities/momentTranslation'

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  children: [{ type: 'text', version: 1, text }],
})

const richText = (...texts: string[]) => ({
  root: {
    type: 'root',
    children: texts.map(paragraph),
    direction: null,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const mockTranslation = () => {
  const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body)) as {
      messages: { content: string }[]
    }
    const input = JSON.parse(body.messages[1].content) as { texts: string[]; title: string }

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: input.title ? `EN ${input.title}` : '',
                texts: input.texts.map((text) => `EN ${text}`),
              }),
            },
          },
        ],
      }),
      { status: 200 },
    )
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('moment translation helpers', () => {
  it('collects and applies rich text nodes in document order', () => {
    const content = richText('第一段', '', '第二段')
    const texts = collectMomentTexts(content)

    expect(texts).toEqual(['第一段', '第二段'])

    const translated = applyMomentTexts(content, ['First', 'Second'])

    expect(collectMomentTexts(translated)).toEqual(['First', 'Second'])
    expect(translated.root.children[1].children[0].text).toBe('')
  })

  it('returns an empty list for content without text', () => {
    expect(collectMomentTexts(null)).toEqual([])
    expect(collectMomentTexts({ root: { type: 'root', children: [] } })).toEqual([])
  })
})

describe('requestMomentTranslation', () => {
  const originalKey = process.env.DEEPSEEK_API_KEY

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env.DEEPSEEK_API_KEY = originalKey
  })

  it('translates title and texts through the DeepSeek chat API', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key'
    const fetchMock = mockTranslation()

    const result = await requestMomentTranslation({ texts: ['一段话'], title: '标题' })

    expect(result).toEqual({ texts: ['EN 一段话'], title: 'EN 标题' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.deepseek.com/chat/completions')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer test-key')
  })

  it('throws when the translation response does not keep the text count', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              choices: [{ message: { content: JSON.stringify({ texts: [], title: '' }) } }],
            }),
          ),
      ),
    )

    await expect(requestMomentTranslation({ texts: ['一段话'], title: '' })).rejects.toThrow(
      'unexpected shape',
    )
  })

  it('throws without an API key', async () => {
    delete process.env.DEEPSEEK_API_KEY

    await expect(requestMomentTranslation({ texts: [], title: '标题' })).rejects.toThrow(
      'DEEPSEEK_API_KEY',
    )
  })
})

describe('moment English translation job', () => {
  let payload: Payload
  const originalKey = process.env.DEEPSEEK_API_KEY
  const createdIds: number[] = []

  const pendingTranslationJobs = async (momentId: number) => {
    const { docs } = await payload.find({
      collection: 'payload-jobs',
      depth: 0,
      limit: 10,
      where: {
        and: [{ taskSlug: { equals: 'translate-moment' } }, { completedAt: { exists: false } }],
      },
    })

    return docs.filter(
      (job) => (job.input as { momentId?: number } | null | undefined)?.momentId === momentId,
    )
  }

  const runTranslationJobs = async (momentId: number) => {
    const jobs = await pendingTranslationJobs(momentId)
    for (const job of jobs) {
      await payload.jobs.runByID({ id: job.id })
    }
    return jobs.length
  }

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env.DEEPSEEK_API_KEY = originalKey
  })

  afterAll(async () => {
    for (const id of createdIds) {
      await payload.delete({ collection: 'moments', id }).catch(() => undefined)
      for (const job of await pendingTranslationJobs(id)) {
        await payload.delete({ collection: 'payload-jobs', id: job.id }).catch(() => undefined)
      }
    }
  })

  it('generates the English version when the Chinese source changes', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key'
    mockTranslation()

    const moment = await payload.create({
      collection: 'moments',
      locale: 'zh',
      context: { skipTranslation: true },
      data: {
        title: '标题',
        content: richText('第一段', '第二段'),
        slug: `translation-test-${Date.now()}`,
      },
    })
    createdIds.push(moment.id)

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'zh',
      data: { title: '新标题' },
    })

    expect(await runTranslationJobs(moment.id)).toBe(1)

    const english = await payload.findByID({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: true,
    })

    expect(english.title).toBe('EN 新标题')
    expect(english.slug).toBe(moment.slug)
    expect(collectMomentTexts(english.content)).toEqual(['EN 第一段', 'EN 第二段'])

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'zh',
      data: { title: '又变了' },
    })

    expect(await runTranslationJobs(moment.id)).toBe(1)

    const regenerated = await payload.findByID({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: true,
    })

    expect(regenerated.title).toBe('EN 又变了')
  })

  it('does not queue translation for English edits or with the skip context', async () => {
    const moment = await payload.create({
      collection: 'moments',
      locale: 'zh',
      context: { skipTranslation: true },
      data: { title: '只翻译中文', slug: `translation-skip-test-${Date.now()}` },
    })
    createdIds.push(moment.id)

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: moment._status !== 'published',
      data: { title: 'English only' },
    })

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'zh',
      context: { skipTranslation: true },
      data: { title: '还是中文' },
    })

    expect(await pendingTranslationJobs(moment.id)).toHaveLength(0)
  })
})
