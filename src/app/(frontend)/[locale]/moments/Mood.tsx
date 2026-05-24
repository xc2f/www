'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

type MoodKey = keyof typeof MOOD_MAP
interface MoodProps {
  mood: MoodKey
}

const MOOD_MAP: Record<string, string> = {
  happy: '😊',
  calm: '😌',
  thoughtful: '🤔',
  tired: '😴',
  sad: '😔',
  energized: '⚡️',
  content: '😎',
  neutral: '🙂',
}

const Mood: React.FC<MoodProps> = ({ mood }) => {
  const t = useTranslations('Moments')
  const emoji = MOOD_MAP[mood] ?? MOOD_MAP.neutral

  return (
    <span className="inline-flex items-center gap-2 text-[0.82rem] text-slate-500 dark:text-white/46">
      <span aria-hidden="true" className="text-[0.95rem] leading-none">
        {emoji}
      </span>
      <span>{t(`mood.${mood}`)}</span>
    </span>
  )
}

export default Mood
