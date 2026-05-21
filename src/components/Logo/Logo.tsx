'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { useEmojis } from '@/app/(frontend)/lib/hooks/useFeeds'

interface Props {
  className?: string
  variant?: 'form' | 'signal'
}

export const Logo = ({ className, variant = 'signal' }: Props) => {
  const { data } = useEmojis()
  const emojis = useMemo(() => data ?? [], [data])
  const [emoji, setEmoji] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (emojis.length > 0) {
      setEmoji(emojis[0])
    }
  }, [emojis])

  useEffect(() => {
    const canCycle = variant === 'signal' && hovered && emojis.length > 0

    if (!canCycle) {
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
  }, [variant, hovered, emojis])

  const thirdChar = variant === 'form' ? '2' : '@'
  const displayChar = variant === 'signal' && hovered && emoji ? emoji : thirdChar

  return (
    <span
      className={clsx(
        'text-2xl font-bold font-logo cursor-pointer select-none text-primary transition duration-300',
        className,
      )}
      onMouseEnter={() => {
        if (variant === 'signal' && emoji) setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
    >
      XC
      <span
        className={clsx(
          'inline-flex w-[1em] justify-center leading-none',
          hovered && variant === 'signal' && 'relative bottom-[3px] right-px scale-[0.9]',
        )}
      >
        {displayChar}
      </span>
      F
    </span>
  )
}
