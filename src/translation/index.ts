/**
 * Reusable "translate to other languages" support.
 *
 * A collection wires it up with:
 * - `autoTranslateField()` in its fields (localized sidebar checkbox)
 * - `createAutoTranslateAfterChange({ collection, fields, taskSlug })` in `hooks.afterChange`
 * - `createTranslateTask({ slug, collection, fields })` in `payload.config` jobs.tasks
 *
 * Each new collection needs a migration for the checkbox column in its locales table.
 */
export { requestTranslation } from './client'
export type { TranslationRequest } from './client'
export {
  aiTranslatedField,
  autoTranslateField,
  DEFAULT_AUTO_TRANSLATE_LOCALES,
  type AiTranslatedFieldOptions,
  type AutoTranslateFieldOptions,
} from './field'
export {
  createAiTranslatedResetHook,
  createAutoTranslateAfterChange,
  type AiTranslatedResetOptions,
  type AutoTranslateHookOptions,
} from './hook'
export { createTranslateTask, type TranslateTaskOptions } from './task'
export { applyTranslatedTexts, collectTranslatableTexts } from './text'
export type { TranslatableField, TranslatableFieldType, TranslationTaskInput } from './types'
