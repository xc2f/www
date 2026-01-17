// lib/hooks/useEmojis.ts
'use client'

import { feedsAPI } from '../api-client/feeds'
import { useAsync } from './useAsync'

type UseEmojisReturn = {
  data: string[] | null
  loading: boolean
  error: Error | null
}

// prettier-ignore
const EMOJIS = [
  "👨‍💻", "🛠️", "💾", "🎨", "🖌️", "📸", "🥟",
  "🍜", "🍕", "🍔", "🍰", "🍩", "☕", "🧋",
  "💪", "🏋️", "🏃", "🧘", "🏆", "✨", "🚀",
  "🔥", "💫", "🤖", "👾", "🧠", "🛸", "🌌",
  "🧩", "📚", "🧪", "🧬", "⚙️", "🔧", "📦",
  "📐", "📊", "🗂️", "🧭", "📍", "🌍", "🎯",
  "🔮", "📡", "🛰️", "🪐", "☄️", "🌟", "🌀"
]

export function useEmojis(): UseEmojisReturn {
  // return useAsync<string[]>(() => feedsAPI.getEmojis(), [])
  return {
    data: EMOJIS,
    loading: false,
    error: null,
  }
}
