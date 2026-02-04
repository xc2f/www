'use client'
import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import { useEmojis } from '@/app/(frontend)/lib/hooks/useFeeds'

interface Props {
  className?: string
}

export const Logo = ({}: Props) => {
  const { data } = useEmojis()
  const [emojis, setEmojis] = useState<string[]>([])
  const [emoji, setEmoji] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (data?.length) {
      setEmojis(data)
      setEmoji(data[0])
    }
  }, [data])

  useEffect(() => {
    if (!hovered || !emoji) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % emojis.length
      setEmoji(emojis[indexRef.current])
    }, 250)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [hovered])

  return (
    <span
      className="text-2xl font-bold font-logo cursor-pointer select-none text-primary"
      onMouseEnter={() => setHovered(!!emoji)}
      onMouseLeave={() => setHovered(false)}
    >
      XC
      <span
        className={clsx(
          'inline-flex w-[1em] justify-center leading-none',
          hovered && 'scale-[0.9] relative bottom-[3px] right-px',
        )}
      >
        {!hovered && '@'}
        {hovered && emoji}
      </span>
      F
    </span>
  )
}
