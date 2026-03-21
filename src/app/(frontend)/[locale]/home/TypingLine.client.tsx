'use client'

import React, { useEffect, useState } from 'react'

const TEXT = 'to the Future.'

export function TypingLine() {
  const [value, setValue] = useState('')

  useEffect(() => {
    let index = 0

    const timer = setInterval(() => {
      index += 1
      setValue(TEXT.slice(0, index))

      if (index >= TEXT.length) {
        clearInterval(timer)
      }
    }, 56)

    return () => clearInterval(timer)
  }, [])

  return (
    <p className="font-mono text-base tracking-[0.1em] text-emerald-200/90 sm:text-lg">
      {'> '}
      {value}
      <span className="ml-1 inline-block h-[1.05em] w-[0.58ch] translate-y-[2px] bg-emerald-200 align-middle animate-[pulse_1.1s_step-end_infinite]" />
    </p>
  )
}
