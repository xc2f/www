import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

import { getLocale } from 'next-intl/server'
import { Locale } from '@/i18n/types'

export async function Header() {
  const locale = (await getLocale()) as Locale

  const headerData: Header = await getCachedGlobal('header', 1)(locale)

  return <HeaderClient data={headerData} />
}
