export type TranslatableFieldType = 'text' | 'richText'

export type TranslatableField = {
  name: string
  type: TranslatableFieldType
}

export type TranslationTaskInput = {
  documentId: number
  sourceLocale?: string | null
  targetLocale?: string | null
}
