import { createTranslateTask, type TranslatableField } from '@/translation'

export const momentTranslatableFields: TranslatableField[] = [
  { name: 'title', type: 'text' },
  { name: 'content', type: 'richText' },
]

export const translateMomentTask = createTranslateTask({
  slug: 'translate-moment',
  collection: 'moments',
  fields: momentTranslatableFields,
  markerField: 'aiTranslated',
  autoTranslateField: 'autoTranslate',
})
