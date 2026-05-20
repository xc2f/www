import type { RequiredDataFromCollectionSlug } from 'payload'

import { getLocale } from 'next-intl/server'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import type { Locale } from '@/i18n/types'

import { AnimatedText } from './AnimatedText.client'
import { HomePageClient } from './HomePageClient'

type HomePageProps = {
  draft: boolean
  page: RequiredDataFromCollectionSlug<'pages'>
  url: string
}

type HomeCopy = {
  panelTitleSegments: Array<{
    highlight?: boolean
    highlightClassName?: string
    text: string
  }>
  title: string
  subtitleSegments: Array<{
    highlight?: boolean
    highlightClassName?: string
    text: string
  }>
}

type CodeToken = {
  text: string
  className?: string
}

const COPY: Record<Locale, HomeCopy> = {
  en: {
    title: 'XC2F',
    subtitleSegments: [
      { text: 'Not a ' },
      {
        text: 'definition',
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#ff8f72]/65 to-[#ff8f72]/65',
      },
      { text: '. Just a ' },
      {
        text: 'presence',
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#7dd7ff]/60 to-[#7dd7ff]/60',
      },
      { text: '.' },
    ],
    panelTitleSegments: [
      { text: 'Still ' },
      {
        text: 'forming',
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#ff8f72]/65 to-[#ff8f72]/65',
      },
      { text: '. Already ' },
      {
        text: 'visible',
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#7dd7ff]/60 to-[#7dd7ff]/60',
      },
      { text: '.' },
    ],
  },
  zh: {
    title: 'XC2F',
    subtitleSegments: [
      { text: '先不要' },
      {
        text: '定义',
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#ff8f72]/65 to-[#ff8f72]/65',
      },
      { text: '它，先让它' },
      {
        text: '存在',
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#7dd7ff]/60 to-[#7dd7ff]/60',
      },
      { text: '。' },
    ],
    panelTitleSegments: [
      { text: '还没完全' },
      {
        text: '成形',
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#ff8f72]/65 to-[#ff8f72]/65',
      },
      { text: '，但已经可以' },
      {
        text: '被看见',
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#7dd7ff]/60 to-[#7dd7ff]/60',
      },
      { text: '。' },
    ],
  },
}

const CODE_SAMPLE_LINES: CodeToken[][] = [
  [
    { text: 'const', className: 'text-[#ff9d86]' },
    { text: ' ' },
    { text: 'page', className: 'text-[#f3f7ff]' },
    { text: ' = ', className: 'text-white/60' },
    { text: 'await', className: 'text-[#7dd7ff]' },
    { text: ' ' },
    { text: 'xc2f', className: 'text-[#c7b7ff]' },
    { text: '.home', className: 'text-[#f3f7ff]' },
    { text: '({', className: 'text-white/60' },
  ],
  [
    { text: '  ' },
    { text: 'state', className: 'text-[#9fe870]' },
    { text: ': ', className: 'text-white/60' },
    { text: "'forming'", className: 'text-[#ffd479]' },
    { text: ',', className: 'text-white/60' },
  ],
  [
    { text: '  ' },
    { text: 'signal', className: 'text-[#9fe870]' },
    { text: ': ', className: 'text-white/60' },
    { text: "'visible'", className: 'text-[#ffd479]' },
    { text: ',', className: 'text-white/60' },
  ],
  [{ text: '})', className: 'text-white/60' }],
  [],
  [
    { text: 'render', className: 'text-[#7dd7ff]' },
    { text: '(', className: 'text-white/60' },
    { text: 'page', className: 'text-[#f3f7ff]' },
    { text: ')', className: 'text-white/60' },
  ],
]

const TITLE_LETTERS = [
  {
    text: 'X',
    className: 'rotate-[-8deg] text-white',
    ghostClassName: '-translate-x-[0.04em] translate-y-[0.03em] text-[#ff8f72]/55',
  },
  {
    text: 'C',
    className: 'translate-y-[0.1em] rotate-[6deg] text-[#ff8f72]',
    ghostClassName: 'translate-x-[0.03em] -translate-y-[0.02em] text-white/35',
  },
  {
    text: '2',
    className: 'scale-[1.1] -rotate-[4deg] text-white/95',
    ghostClassName: '-translate-x-[0.03em] translate-y-[0.04em] text-[#7dd7ff]/45',
  },
  {
    text: 'F',
    className: '-translate-y-[0.08em] rotate-[-5deg] text-[#7dd7ff]',
    ghostClassName: 'translate-x-[0.035em] translate-y-[0.02em] text-white/30',
  },
] as const

export async function HomePage({ draft, page, url }: HomePageProps) {
  void page

  const locale = (await getLocale()) as Locale
  const copy = COPY[locale]

  return (
    <main
      className="relative flex min-h-0 flex-1 items-center overflow-hidden bg-[#06080A] text-white"
      data-theme="dark"
    >
      <HomePageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#02050B] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      <div className="mux-grid pointer-events-none absolute inset-0 opacity-50" />

      <section className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)] lg:items-center">
          <div className="max-w-2xl">
            <h1
              aria-label={copy.title}
              className="group/title max-w-4xl font-sans text-[clamp(4rem,10vw,8.4rem)] leading-[0.82] font-black tracking-[-0.16em]"
            >
              <span className="inline-flex items-end gap-0">
                {TITLE_LETTERS.map((letter) => (
                  <span
                    key={letter.text}
                    className="relative inline-block transition-transform duration-500 ease-out group-hover/title:-translate-y-1"
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 inline-block blur-[0.5px] transition duration-500 ease-out group-hover/title:scale-[1.04] group-hover/title:opacity-100 ${letter.ghostClassName}`}
                    >
                      {letter.text}
                    </span>
                    <span
                      className={`relative inline-block ${letter.className} ${
                        letter.text === '2'
                          ? '[text-shadow:0_0_28px_rgba(255,255,255,0.16)]'
                          : '[text-shadow:0_0_18px_rgba(255,255,255,0.08)]'
                      } transition duration-500 ease-out group-hover/title:scale-[1.03]`}
                      style={{
                        WebkitTextStroke:
                          letter.text === '2' ? '1px rgba(255,255,255,0.24)' : undefined,
                      }}
                    >
                      {letter.text}
                    </span>
                  </span>
                ))}
              </span>
            </h1>
            <AnimatedText
              className="mt-5 block max-w-xl text-lg leading-8 text-white/68 transition duration-300 hover:text-white/82 sm:text-xl"
              enableHoverHighlight
              delayMs={180}
              segments={copy.subtitleSegments}
              text={copy.subtitleSegments.map((segment) => segment.text).join('')}
            />
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1019]/90 shadow-[0_24px_120px_rgba(0,0,0,0.55)] backdrop-blur">
              <div className="grid gap-4 p-5 lg:p-6">
                <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 lg:p-5">
                  <AnimatedText
                    charClassName="font-mono"
                    className="text-lg tracking-[-0.02em] text-white sm:text-xl"
                    delayMs={420}
                    enableHoverHighlight
                    segments={copy.panelTitleSegments}
                    staggerMs={28}
                    text={copy.panelTitleSegments.map((segment) => segment.text).join('')}
                  />
                </div>

                <div className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-black/50">
                  <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b4a]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#43d9ad]" />
                    <p className="ml-2 text-[11px] uppercase tracking-[0.24em] text-white/38">
                      home.ts
                    </p>
                  </div>
                  <pre className="overflow-x-auto px-5 py-4 text-sm leading-7">
                    <code>
                      {CODE_SAMPLE_LINES.map((line, lineIndex) => (
                        <span key={lineIndex} className="block">
                          {line.length === 0 ? (
                            <span>&nbsp;</span>
                          ) : (
                            line.map((token, tokenIndex) => (
                              <span
                                key={`${lineIndex}-${tokenIndex}`}
                                className={`${token.className ?? ''} rounded px-0.5 transition duration-200 hover:bg-white/10`}
                              >
                                {token.text}
                              </span>
                            ))
                          )}
                        </span>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
