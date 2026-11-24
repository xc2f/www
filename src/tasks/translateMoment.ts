import type { TaskConfig } from 'payload'

import {
  applyMomentTexts,
  collectMomentTexts,
  requestMomentTranslation,
} from '../utilities/momentTranslation'

export const translateMomentTask: TaskConfig<{
  input: { momentId: number }
  output: { translated: boolean }
}> = {
  slug: 'translate-moment',
  inputSchema: [{ name: 'momentId', type: 'number', required: true }],
  outputSchema: [{ name: 'translated', type: 'checkbox' }],
  retries: 2,
  handler: async ({ input, req }) => {
    const { payload } = req

    if (!process.env.DEEPSEEK_API_KEY) {
      payload.logger.warn('Skipping moment translation: DEEPSEEK_API_KEY is not configured')
      return { output: { translated: false } }
    }

    const moment = await payload.findByID({
      collection: 'moments',
      id: input.momentId,
      draft: true,
      locale: 'zh',
      req,
    })

    const title = (moment.title ?? '').trim()
    const content = moment.content ?? null
    const texts = collectMomentTexts(content)

    if (!title && texts.length === 0) {
      return { output: { translated: false } }
    }

    const translation = await requestMomentTranslation({ texts, title })

    await payload.update({
      collection: 'moments',
      id: input.momentId,
      locale: 'en',
      draft: moment._status !== 'published',
      context: { skipTranslation: true },
      data: {
        title: title ? translation.title : title,
        content: content ? applyMomentTexts(content, translation.texts) : content,
      },
      req,
    })

    return { output: { translated: true } }
  },
}
