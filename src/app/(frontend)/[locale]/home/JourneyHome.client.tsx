'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type Stage = {
  id: 'explore' | 'create' | 'future'
  label: string
}

const STAGES: Stage[] = [
  { id: 'explore', label: 'EXPLORE' },
  { id: 'create', label: 'CREATE' },
  { id: 'future', label: 'TO FUTURE' },
]

const CENTER_STAGE_LABELS: Partial<Record<Stage['id'], string>> = {
  explore: 'UNKNOWN',
  create: 'FUTURE',
}

const LETTER_MAP: Record<string, string> = {
  X: 'Explore',
  C: 'Create',
  '2': 'To',
  F: 'Future',
}

const STAGE_TITLE_CLASS =
  'font-sans text-[clamp(3.2rem,9vw,9rem)] font-semibold tracking-[0.2em]'

export function JourneyHome() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const sectionRefs = useRef<Array<HTMLElement | null>>([])

  const [activeStage, setActiveStage] = useState<Stage['id']>('explore')
  const [progress, setProgress] = useState(0)
  const [centerStage, setCenterStage] = useState<Stage['id'] | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let current: Stage['id'] | null = null

        for (const entry of entries) {
          if (entry.isIntersecting) {
            current = entry.target.getAttribute('data-stage') as Stage['id']
          }
        }

        if (current) {
          setActiveStage(current)
        }
      },
      {
        root: null,
        threshold: 0.6,
      },
    )

    for (const section of sectionRefs.current) {
      if (section) observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const viewport = window.innerHeight
      const total = rect.height - viewport
      const centerLine = viewport * 0.38
      const overlapThreshold = viewport * 0.09

      let overlappingStage: Stage['id'] | null = null
      let closestDistance = Number.POSITIVE_INFINITY

      for (const section of sectionRefs.current) {
        if (!section) continue

        const stage = section.getAttribute('data-stage') as Stage['id'] | null
        if (!stage || stage === 'future') continue

        const sectionRect = section.getBoundingClientRect()
        const labelCenter = sectionRect.top + sectionRect.height / 2
        const distance = Math.abs(labelCenter - centerLine)

        if (distance < overlapThreshold && distance < closestDistance) {
          overlappingStage = stage
          closestDistance = distance
        }
      }

      setCenterStage(overlappingStage)

      if (total <= 0) {
        setProgress(0)
        return
      }

      const current = Math.min(Math.max(-rect.top, 0), total)
      setProgress(current / total)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const pathWidth = useMemo(() => `${Math.max(8, progress * 100)}%`, [progress])

  return (
    <div ref={wrapperRef} className="relative z-0 bg-[#02050b] text-white">
      <Background activeStage={activeStage} />

      <div className="pointer-events-none sticky top-0 z-10 h-screen">
        <div className="relative mx-auto flex h-full w-full max-w-6xl items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
            <div className="relative w-full">
              <div className="h-px w-full bg-white/15" />
              <div
                className="absolute left-0 top-0 h-px bg-gradient-to-r from-cyan-300/95 via-blue-300/90 to-cyan-200/85 shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-[width] duration-300"
                style={{ width: pathWidth }}
              />

              <PathNode label="Explore" x="0%" active={progress >= 0.08} />
              <PathNode label="Create" x="34%" active={progress >= 0.36} />
              <PathNode label="To" x="64%" active={progress >= 0.66} />
              <PathNode label="Future" x="100%" active={progress >= 0.93} alignRight />
            </div>
          </div>

          {activeStage !== 'future' && (
            <div className="absolute left-1/2 top-[38%] -translate-x-1/2 text-center">
              <p
                className={`${STAGE_TITLE_CLASS} transition-all duration-200 ${
                  centerStage === activeStage
                    ? 'scale-100 text-white/95 drop-shadow-[0_0_24px_rgba(125,211,252,0.3)]'
                    : 'scale-[0.985] text-white/20'
                }`}
              >
                {CENTER_STAGE_LABELS[activeStage]}
              </p>
            </div>
          )}
        </div>
      </div>

      <section
        ref={(el) => {
          sectionRefs.current[0] = el
        }}
        data-stage="explore"
        className="relative z-10 flex min-h-screen items-center justify-center"
      >
        <StageLabel text="EXPLORE" tone="text-blue-100/95" />
      </section>

      <section
        ref={(el) => {
          sectionRefs.current[1] = el
        }}
        data-stage="create"
        className="relative z-10 flex min-h-screen items-center justify-center"
      >
        <StageLabel text="CREATE" tone="text-cyan-100/95" />
      </section>

      <section
        ref={(el) => {
          sectionRefs.current[2] = el
        }}
        data-stage="future"
        className="relative z-10 min-h-screen"
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            {['X', 'C', '2', 'F'].map((char) => {
              const active = hovered === char
              return (
                <button
                  key={char}
                  type="button"
                  className="font-sans text-[clamp(3.5rem,10vw,10rem)] leading-none font-semibold tracking-[0.12em] text-white/92 transition duration-300 hover:text-cyan-200"
                  onMouseEnter={() => setHovered(char)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(char)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${char} means ${LETTER_MAP[char]}`}
                >
                  <span
                    className={
                      active
                        ? 'drop-shadow-[0_0_24px_rgba(56,189,248,0.7)]'
                        : 'drop-shadow-[0_0_8px_rgba(59,130,246,0.25)]'
                    }
                  >
                    {char}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-20 text-center sm:translate-y-24">
          <p className="font-mono text-sm tracking-[0.22em] text-cyan-100/80 uppercase sm:text-base">
            {hovered ? `${LETTER_MAP[hovered]}` : 'Unknown to Create. Create to Future.'}
          </p>
        </div>
      </section>
    </div>
  )
}

function StageLabel({ text, tone }: { text: string; tone: string }) {
  return <p className={`${STAGE_TITLE_CLASS} ${tone}`}>{text}</p>
}

function PathNode({
  active,
  alignRight,
  label,
  x,
}: {
  active: boolean
  alignRight?: boolean
  label: string
  x: string
}) {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 ${alignRight ? '-translate-x-full' : ''}`}
      style={{ left: x }}
    >
      <div
        className={`h-2.5 w-2.5 rounded-full border transition ${
          active
            ? 'border-cyan-100 bg-cyan-200 shadow-[0_0_16px_rgba(56,189,248,0.85)]'
            : 'border-white/50 bg-white/20'
        }`}
      />
      <p
        className={`mt-3 font-mono text-[10px] tracking-[0.18em] text-white/72 uppercase sm:text-[11px] ${
          alignRight ? 'pr-1 text-right' : ''
        }`}
      >
        {label}
      </p>
    </div>
  )
}

function Background({ activeStage }: { activeStage: Stage['id'] }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 w-screen max-w-full overflow-hidden">
      <div
        className={`home-bg-breathe-explore absolute inset-0 transition-opacity duration-700 ${
          activeStage === 'explore' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_35%,rgba(99,102,241,0.45),transparent_38%),radial-gradient(circle_at_65%_52%,rgba(59,130,246,0.22),transparent_45%),linear-gradient(to_bottom,rgba(5,8,18,1),rgba(2,4,10,1))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0.8px,transparent_0.8px)] [background-size:3px_3px] opacity-[0.13]" />
      </div>

      <div
        className={`home-bg-breathe-create absolute inset-0 transition-opacity duration-700 ${
          activeStage === 'create' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,8,16,1),rgba(1,6,12,1)),radial-gradient(circle_at_55%_42%,rgba(34,211,238,0.18),transparent_42%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(120deg,rgba(56,189,248,0.35)_1px,transparent_1px)] [background-size:24px_16px]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(0deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:100%_8px]" />
      </div>

      <div
        className={`home-bg-breathe-future absolute inset-0 transition-opacity duration-700 ${
          activeStage === 'future' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,5,8,1),rgba(1,2,4,1))]" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.32),transparent_62%)]" />
      </div>
    </div>
  )
}
