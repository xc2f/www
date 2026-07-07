import { revalidatePath } from 'next/cache'

import { routing } from '@/i18n/routing'

const withLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`)

export const getLocalizedPaths = (path: string): string[] => {
  const normalizedPath = withLeadingSlash(path)
  const localizedPaths = routing.locales.map((locale) =>
    normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`,
  )

  return [...new Set([normalizedPath, ...localizedPaths])]
}

export const revalidateLocalizedPath = (path: string): void => {
  for (const localizedPath of getLocalizedPaths(path)) {
    revalidatePath(localizedPath)
  }
}
