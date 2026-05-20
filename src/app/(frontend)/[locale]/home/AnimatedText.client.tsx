'use client'

import React, { useEffect, useState } from 'react'

type AnimatedTextProps = {
  charClassName?: string
  className?: string
  delayMs?: number
  enableHoverHighlight?: boolean
  segments?: Array<{
    highlight?: boolean
    highlightClassName?: string
    text: string
  }>
  staggerMs?: number
  text: string
}

export function AnimatedText({
  charClassName,
  className,
  delayMs = 0,
  enableHoverHighlight = false,
  segments,
  staggerMs = 36,
  text,
}: AnimatedTextProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const resolvedSegments = segments ?? [{ text }]
  const resolvedText = resolvedSegments.map((segment) => segment.text).join('')

  useEffect(() => {
    setVisibleCount(0)
    let interval: number | undefined

    const startTimer = window.setTimeout(() => {
      let current = 0

      interval = window.setInterval(() => {
        current += 1
        setVisibleCount(current)

        if (current >= resolvedText.length) {
          window.clearInterval(interval)
        }
      }, staggerMs)
    }, delayMs)

    return () => {
      window.clearTimeout(startTimer)
      if (interval !== undefined) {
        window.clearInterval(interval)
      }
    }
  }, [delayMs, resolvedText, staggerMs])

  let globalIndex = 0

  return (
    <span aria-label={resolvedText} className={className}>
      <span className="sr-only">{resolvedText}</span>
      <span
        aria-hidden="true"
        className="inline-block"
        onMouseEnter={enableHoverHighlight ? () => setIsHovered(true) : undefined}
        onMouseLeave={enableHoverHighlight ? () => setIsHovered(false) : undefined}
      >
        {resolvedSegments.map((segment, segmentIndex) => {
          const chars = Array.from(segment.text)

          return (
            <span
              key={`${segment.text}-${segmentIndex}`}
              className={
                segment.highlight
                  ? `inline-block rounded px-1 bg-no-repeat transition-[background-size] duration-300 ease-out ${segment.highlightClassName ?? ''}`
                  : undefined
              }
              style={
                segment.highlight
                  ? {
                      backgroundSize: isHovered ? '100% 100%' : '0% 100%',
                      transitionDelay: isHovered ? `${segmentIndex * 90}ms` : '0ms',
                    }
                  : undefined
              }
            >
              {chars.map((char, charIndex) => {
                const currentIndex = globalIndex
                globalIndex += 1

                return (
                  <span
                    key={`${char}-${segmentIndex}-${charIndex}`}
                    className={`inline-block whitespace-pre ${charClassName ?? ''} ${
                      currentIndex < visibleCount ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )
              })}
            </span>
          )
        })}
      </span>
    </span>
  )
}
