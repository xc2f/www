import type { CollectionSlug, TaskConfig, TypedLocale } from 'payload'

import { requestTranslation } from './client'
import { applyTranslatedTexts, collectTranslatableTexts } from './text'
import type { TranslatableField, TranslationTaskInput } from './types'

export type TranslateTaskOptions = {
  slug: string
  collection: CollectionSlug
  fields: TranslatableField[]
  retries?: number
  /** Localized checkbox field set to `true` on the locale written by this task. */
  markerField?: string
  /**
   * Localized switch that queues translations on save. It is written as `false`
   * on the translated locale so AI output is not used as a translation source.
   */
  autoTranslateField?: string
}

/**
 * Creates a Payload task that translates one document from its source locale
 * into the requested target locale, writing only the configured fields.
 */
export const createTranslateTask = ({
  slug,
  collection,
  fields,
  retries = 2,
  markerField,
  autoTranslateField,
}: TranslateTaskOptions): TaskConfig<{
  input: TranslationTaskInput
  output: { translated: boolean }
}> => ({
  slug,
  inputSchema: [
    { name: 'documentId', type: 'number', required: true },
    { name: 'sourceLocale', type: 'text' },
    { name: 'targetLocale', type: 'text' },
  ],
  outputSchema: [{ name: 'translated', type: 'checkbox' }],
  retries,
  handler: async ({ input, req }) => {
    const { payload } = req

    const localization = payload.config.localization
    const sourceLocale = input.sourceLocale ?? (localization ? localization.defaultLocale : undefined)
    const targetLocale = input.targetLocale

    if (!sourceLocale || !targetLocale || sourceLocale === targetLocale) {
      payload.logger.warn(
        `Skipping translation: invalid locale pair ${String(sourceLocale)} -> ${String(targetLocale)}`,
      )
      return { output: { translated: false } }
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      payload.logger.warn('Skipping translation: DEEPSEEK_API_KEY is not configured')
      return { output: { translated: false } }
    }

    const hasDrafts = Boolean(payload.collections[collection]?.config.versions?.drafts)

    const document = (await payload.findByID({
      collection,
      id: input.documentId,
      draft: hasDrafts ? true : undefined,
      fallbackLocale: false,
      locale: sourceLocale as never,
      req,
    })) as unknown as Record<string, unknown>

    const texts = collectTranslatableTexts(document, fields)
    if (texts.length === 0) {
      return { output: { translated: false } }
    }

    const translations = await requestTranslation({ texts, targetLocale })
    applyTranslatedTexts(document, fields, translations)

    const data: Record<string, unknown> = Object.fromEntries(
      fields.map((field) => [field.name, document[field.name]]),
    )
    if (markerField) {
      data[markerField] = true
    }
    if (autoTranslateField) {
      data[autoTranslateField] = false
    }

    await payload.update({
      collection,
      id: input.documentId,
      locale: targetLocale as TypedLocale,
      draft: hasDrafts ? document._status !== 'published' : undefined,
      context: { skipTranslation: true },
      data: data as never,
      req,
    })

    return { output: { translated: true } }
  },
})
