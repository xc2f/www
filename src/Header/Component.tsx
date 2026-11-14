import { getLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/types'
import { getCachedGlobal } from '@/utilities/getGlobals'

import { HeaderClient } from './Component.client'

export async function Header() {
  const locale = (await getLocale()) as Locale
  const { navItems } = await getCachedGlobal('header', 1)(locale)

  return <HeaderClient navItems={navItems} />
}
