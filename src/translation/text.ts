import type { TranslatableField } from './types'

type TextSlot = {
  read: () => string
  write: (text: string) => void
}

const collectRichTextSlots = (value: unknown, slots: TextSlot[]) => {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectRichTextSlots(entry, slots))
    return
  }

  if (!value || typeof value !== 'object') return

  const node = value as Record<string, unknown>
  const text = node.text
  if (typeof text === 'string' && text.trim().length > 0) {
    slots.push({
      read: () => node.text as string,
      write: (translated) => {
        node.text = translated
      },
    })
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === 'text') continue
    if (child && typeof child === 'object') collectRichTextSlots(child, slots)
  }
}

const collectSlots = (document: Record<string, unknown>, fields: TranslatableField[]) => {
  const slots: TextSlot[] = []

  for (const field of fields) {
    const value = document[field.name]

    if (field.type === 'text') {
      if (typeof value === 'string' && value.trim().length > 0) {
        slots.push({
          read: () => document[field.name] as string,
          write: (translated) => {
            document[field.name] = translated
          },
        })
      }
      continue
    }

    collectRichTextSlots(value, slots)
  }

  return slots
}

export const collectTranslatableTexts = (
  document: Record<string, unknown>,
  fields: TranslatableField[],
): string[] => collectSlots(document, fields).map((slot) => slot.read())

export const applyTranslatedTexts = <TDoc extends Record<string, unknown>>(
  document: TDoc,
  fields: TranslatableField[],
  translations: string[],
): TDoc => {
  const slots = collectSlots(document, fields)

  if (slots.length !== translations.length) {
    throw new Error(
      `Translated text count mismatch: expected ${slots.length}, received ${translations.length}`,
    )
  }

  slots.forEach((slot, index) => slot.write(translations[index]))

  return document
}
