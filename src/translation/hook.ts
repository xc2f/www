import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionSlug,
  Payload,
} from 'payload'

import { DEFAULT_AUTO_TRANSLATE_LOCALES } from './field'
import { collectTranslatableTexts } from './text'
import type { TranslatableField } from './types'

export type AutoTranslateHookOptions = {
  collection: CollectionSlug
  fields: TranslatableField[]
  flagField?: string
  taskSlug: string
  defaultCheckedLocales?: string[]
}

const getLocaleCodes = (payload: Payload): string[] => {
  const localization = payload.config.localization
  if (!localization) return []
  return localization.locales.map((locale) => locale.code)
}

/**
 * Queues a translation job when a document is saved with the auto translate
 * switch on, targeting every locale other than the one being edited.
 */
export const createAutoTranslateAfterChange = ({
  collection,
  fields,
  flagField = 'autoTranslate',
  taskSlug,
  defaultCheckedLocales = DEFAULT_AUTO_TRANSLATE_LOCALES,
}: AutoTranslateHookOptions): CollectionAfterChangeHook => {
  return async ({ context, doc, req }) => {
    if (context.skipTranslation) return doc

    const localization = req.payload.config.localization
    const sourceLocale = req.locale ?? (localization ? localization.defaultLocale : undefined)
    if (!sourceLocale) return doc

    const targetLocales = getLocaleCodes(req.payload).filter((code) => code !== sourceLocale)
    if (!targetLocales.length) return doc

    const hasDrafts = Boolean(req.payload.collections[collection]?.config.versions?.drafts)

    // Read without fallback so the other locale's switch never leaks into this decision.
    const current = (await req.payload.findByID({
      collection,
      id: doc.id,
      draft: hasDrafts ? true : undefined,
      fallbackLocale: false,
      locale: sourceLocale as never,
      req,
    })) as unknown as Record<string, unknown>

    const autoTranslate = current[flagField] ?? defaultCheckedLocales.includes(sourceLocale)
    if (!autoTranslate) return doc

    if (collectTranslatableTexts(current, fields).length === 0) return doc

    for (const targetLocale of targetLocales) {
      await req.payload.jobs.queue({
        task: taskSlug as never,
        input: { documentId: doc.id, sourceLocale, targetLocale } as never,
        req,
      })
    }

    return doc
  }
}

export type AiTranslatedResetOptions = {
  fields: TranslatableField[]
  markerField?: string
}

const isEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false

  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false

  return aKeys.every((key) =>
    isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  )
}

/**
 * Clears the "translated by AI" marker when a human save changes one of the
 * translatable fields. AI writes pass `context.skipTranslation` and keep it.
 */
export const createAiTranslatedResetHook = ({
  fields,
  markerField = 'aiTranslated',
}: AiTranslatedResetOptions): CollectionBeforeChangeHook => {
  return async ({ context, data, originalDoc }) => {
    if (!data || !originalDoc || context.skipTranslation) return data

    const original = originalDoc as Record<string, unknown>
    const edited = fields.some(
      (field) => data[field.name] !== undefined && !isEqual(data[field.name], original[field.name]),
    )

    if (edited) {
      data[markerField] = false
    }

    return data
  }
}
