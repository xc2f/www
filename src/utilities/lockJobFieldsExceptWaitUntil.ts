import type { Field } from 'payload'

/**
 * Only `waitUntil` may be edited from the Admin UI. Every other job field is
 * owned by the queue, so it is locked both in the UI and at the field-access
 * level (field access strips disallowed values from incoming updates).
 */
export const lockJobFieldsExceptWaitUntil = (fields: Field[]): Field[] =>
  fields.map((field): Field => {
    if (field.type === 'tabs') {
      return {
        ...field,
        tabs: field.tabs.map((tab) => ({
          ...tab,
          fields: lockJobFieldsExceptWaitUntil(tab.fields),
        })),
      }
    }

    if (
      field.type === 'group' ||
      field.type === 'array' ||
      field.type === 'row' ||
      field.type === 'collapsible'
    ) {
      return { ...field, fields: lockJobFieldsExceptWaitUntil(field.fields) }
    }

    if (field.type === 'ui') {
      return field
    }

    if (field.name === 'waitUntil') {
      return {
        ...field,
        access: {
          ...field.access,
          // Cancelled (`hasError`) and finished jobs are terminal: their schedule
          // is never consulted again, and the queue strips `waitUntil` on save.
          update: ({
            doc,
          }: {
            doc?: { completedAt?: string | null; hasError?: boolean | null }
          }) => !doc?.completedAt && !doc?.hasError,
        },
      } as unknown as Field
    }

    return {
      ...field,
      access: { ...field.access, update: () => false },
      admin: { ...field.admin, readOnly: true },
    } as unknown as Field
  })
