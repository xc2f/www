import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

import { findFeedBySlug } from '@/queries/feeds'

export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()

  let emojis: string[] = []
  const emojiData = await findFeedBySlug('logo-emojis')
  if (emojiData) {
    const json = emojiData.json || []
    emojis = Array.isArray(json) ? json.filter((v): v is string => typeof v === 'string') : []
  }

  return <HeaderClient data={headerData} emojis={emojis} />
}
