import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  applyTranslatedTexts,
  collectTranslatableTexts,
  requestTranslation,
  type TranslatableField,
} from '@/translation'

const momentFields: TranslatableField[] = [
  { name: 'title', type: 'text' },
  { name: 'content', type: 'richText' },
]

const collectContentTexts = (content: unknown) =>
  collectTranslatableTexts({ content }, momentFields)

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
    const prefix = body.messages[0].content.includes('Simplified Chinese') ? 'ZH' : 'EN'
    const input = JSON.parse(body.messages[1].content) as { texts: string[] }

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                texts: input.texts.map((text) => `${prefix} ${text}`),
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

describe('translation text helpers', () => {
  it('collects and applies rich text nodes in document order', () => {
    const content = richText('第一段', '', '第二段')
    const texts = collectContentTexts(content)

    expect(texts).toEqual(['第一段', '第二段'])

    const translated = applyTranslatedTexts({ content }, momentFields, ['First', 'Second'])

    expect(collectContentTexts(translated.content)).toEqual(['First', 'Second'])
    expect(translated.content.root.children[1].children[0].text).toBe('')
  })

  it('collects text fields in field order', () => {
    const document = { title: '标题', content: richText('第一段') }

    expect(collectTranslatableTexts(document, momentFields)).toEqual(['标题', '第一段'])
  })

  it('returns an empty list for content without text', () => {
    expect(collectContentTexts(null)).toEqual([])
    expect(collectContentTexts({ root: { type: 'root', children: [] } })).toEqual([])
    expect(collectTranslatableTexts({ title: '  ', content: null }, momentFields)).toEqual([])
  })

  it('rejects translations with a different text count', () => {
    expect(() =>
      applyTranslatedTexts({ title: '标题' }, momentFields, ['one', 'two']),
    ).toThrow('count mismatch')
  })
})

describe('requestTranslation', () => {
  const originalKey = process.env.DEEPSEEK_API_KEY

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env.DEEPSEEK_API_KEY = originalKey
  })

  it('translates texts through the DeepSeek chat API', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key'
    const fetchMock = mockTranslation()

    const result = await requestTranslation({ texts: ['一段话'], targetLocale: 'en' })

    expect(result).toEqual(['EN 一段话'])

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.deepseek.com/chat/completions')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer test-key')
  })

  it('translates into Simplified Chinese when the target is Chinese', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key'
    const fetchMock = mockTranslation()

    const result = await requestTranslation({ texts: ['Hello'], targetLocale: 'zh' })

    expect(result).toEqual(['ZH Hello'])
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      messages: { content: string }[]
    }
    expect(body.messages[0].content).toContain('Simplified Chinese')
  })

  it('throws when the translation response does not keep the text count', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              choices: [{ message: { content: JSON.stringify({ texts: [] }) } }],
            }),
          ),
      ),
    )

    await expect(requestTranslation({ texts: ['一段话'], targetLocale: 'en' })).rejects.toThrow(
      'unexpected shape',
    )
  })

  it('throws without an API key', async () => {
    delete process.env.DEEPSEEK_API_KEY

    await expect(requestTranslation({ texts: [], targetLocale: 'en' })).rejects.toThrow(
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
      (job) =>
        (job.input as { documentId?: number } | null | undefined)?.documentId === momentId,
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
    expect(english.aiTranslated).toBe(true)
    expect(english.autoTranslate).toBe(false)
    expect(collectContentTexts(english.content)).toEqual(['EN 第一段', 'EN 第二段'])

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

  it('defaults the switch on for Chinese and off for English', async () => {
    const moment = await payload.create({
      collection: 'moments',
      locale: 'zh',
      context: { skipTranslation: true },
      data: { title: '默认开关', slug: `translation-default-test-${Date.now()}` },
    })
    createdIds.push(moment.id)

    const chinese = await payload.findByID({
      collection: 'moments',
      id: moment.id,
      locale: 'zh',
      draft: true,
      fallbackLocale: false,
    })
    const english = await payload.findByID({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: true,
      fallbackLocale: false,
    })

    expect(chinese.autoTranslate).toBe(true)
    expect(english.autoTranslate ?? false).toBe(false)
  })

  it('translates English back to Chinese when the English switch is enabled', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key'
    mockTranslation()

    const moment = await payload.create({
      collection: 'moments',
      locale: 'zh',
      context: { skipTranslation: true },
      data: {
        title: '中文标题',
        content: richText('中文段落'),
        slug: `translation-reverse-test-${Date.now()}`,
      },
    })
    createdIds.push(moment.id)

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: moment._status !== 'published',
      data: {
        title: 'English title',
        content: richText('English paragraph'),
        autoTranslate: true,
      },
    })

    expect(await runTranslationJobs(moment.id)).toBe(1)

    const chinese = await payload.findByID({
      collection: 'moments',
      id: moment.id,
      locale: 'zh',
      draft: true,
      fallbackLocale: false,
    })

    expect(chinese.title).toBe('ZH English title')
    expect(chinese.aiTranslated).toBe(true)
    expect(chinese.autoTranslate).toBe(false)
    expect(collectContentTexts(chinese.content)).toEqual(['ZH English paragraph'])
  })

  it('clears the AI marker only when the translated content is edited by hand', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key'
    mockTranslation()

    const moment = await payload.create({
      collection: 'moments',
      locale: 'zh',
      context: { skipTranslation: true },
      data: {
        title: '手工校对',
        content: richText('中文段落'),
        slug: `translation-manual-edit-test-${Date.now()}`,
      },
    })
    createdIds.push(moment.id)

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'zh',
      data: { title: '手工校对标题' },
    })

    expect(await runTranslationJobs(moment.id)).toBe(1)

    const translated = await payload.findByID({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: true,
      fallbackLocale: false,
    })
    expect(translated.aiTranslated).toBe(true)

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: moment._status !== 'published',
      data: { mood: 'happy' },
    })

    const afterMetaEdit = await payload.findByID({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: true,
      fallbackLocale: false,
    })
    expect(afterMetaEdit.aiTranslated).toBe(true)

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: moment._status !== 'published',
      data: { title: 'Hand written title' },
    })

    const afterContentEdit = await payload.findByID({
      collection: 'moments',
      id: moment.id,
      locale: 'en',
      draft: true,
      fallbackLocale: false,
    })
    expect(afterContentEdit.aiTranslated).toBe(false)
  })

  it('does not queue translation when the switch is turned off', async () => {
    const moment = await payload.create({
      collection: 'moments',
      locale: 'zh',
      context: { skipTranslation: true },
      data: { title: '关闭翻译', slug: `translation-off-test-${Date.now()}` },
    })
    createdIds.push(moment.id)

    await payload.update({
      collection: 'moments',
      id: moment.id,
      locale: 'zh',
      data: { title: '关闭翻译后更新', autoTranslate: false },
    })

    expect(await pendingTranslationJobs(moment.id)).toHaveLength(0)
  })
})
