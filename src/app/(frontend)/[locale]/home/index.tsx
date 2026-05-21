import type { RequiredDataFromCollectionSlug } from 'payload'

import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
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
  terminalLabel: string
  terminalSignal: string
  terminalStatus: string
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
    className: 'scale-[1.1] -rotate-[4deg] text-black/55',
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

  const locale = await getLocale()
  const t = await getTranslations('Home')
  const isZh = locale === 'zh'
  const copy: HomeCopy = {
    title: t('title'),
    terminalLabel: t('terminal.label'),
    terminalSignal: t('terminal.signal'),
    terminalStatus: t('terminal.status'),
    subtitleSegments: [
      { text: t('subtitle.before') },
      {
        text: t('subtitle.highlight1'),
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#ff8f72]/65 to-[#ff8f72]/65',
      },
      { text: t('subtitle.middle') },
      {
        text: t('subtitle.highlight2'),
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#7dd7ff]/60 to-[#7dd7ff]/60',
      },
      { text: t('subtitle.after') },
    ],
    panelTitleSegments: [
      { text: t('panel.before') },
      {
        text: t('panel.highlight1'),
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#ff8f72]/65 to-[#ff8f72]/65',
      },
      { text: t('panel.middle') },
      {
        text: t('panel.highlight2'),
        highlight: true,
        highlightClassName: 'bg-gradient-to-r from-[#7dd7ff]/60 to-[#7dd7ff]/60',
      },
      { text: t('panel.after') },
    ],
  }
  const statusLine = t('statusLine')

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_34%,rgba(255,143,114,0.042),transparent_40%),radial-gradient(circle_at_74%_42%,rgba(125,215,255,0.03),transparent_46%),radial-gradient(circle_at_56%_86%,rgba(255,255,255,0.024),transparent_42%),linear-gradient(180deg,rgba(4,7,11,0.22),rgba(3,5,8,0.05)_38%,rgba(2,4,7,0.24)_100%)]" />
      <div className="home-atmosphere home-atmosphere-drift-a pointer-events-none absolute -left-[16%] top-[2%] h-[56rem] w-[54rem] rounded-full bg-[radial-gradient(circle,rgba(255,143,114,0.07),transparent_70%)] opacity-60" />
      <div className="home-atmosphere home-atmosphere-drift-b pointer-events-none absolute right-[-20%] top-[14%] h-[60rem] w-[56rem] rounded-full bg-[radial-gradient(circle,rgba(125,215,255,0.064),transparent_72%)] opacity-56" />
      <div className="home-haze home-haze-drift home-light-breathe pointer-events-none absolute inset-x-[8%] top-[14%] h-[24rem] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.028),transparent_70%)] opacity-45" />
      <div className="mux-grid pointer-events-none absolute inset-0 opacity-[0.34]" />
      <div className="home-noise pointer-events-none absolute inset-0 opacity-[0.1]" />
      <div className="home-vignette pointer-events-none absolute inset-0 opacity-[0.92]" />

      <section className="relative mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.04fr)_minmax(340px,0.88fr)] lg:items-center lg:gap-12">
          <div className="max-w-2xl lg:pt-14">
            <h1
              aria-label={copy.title}
              className="home-hero-anchor max-w-4xl font-sans text-[clamp(4.8rem,12vw,9.6rem)] leading-[0.78] font-black tracking-[-0.15em]"
            >
              <span className="home-title-shell home-title-breathe group/title inline-flex items-end gap-0">
                <span className="home-title-grain" aria-hidden="true" />
                {TITLE_LETTERS.map((letter) => (
                  <span
                    key={letter.text}
                    className="home-title-letter relative inline-block transition-transform duration-500 ease-out"
                  >
                    <span
                      aria-hidden="true"
                      className={`home-title-ghost pointer-events-none absolute inset-0 inline-block blur-[0.8px] transition duration-500 ease-out group-hover/title:scale-[1.04] group-hover/title:opacity-100 ${letter.ghostClassName}`}
                    >
                      {letter.text}
                    </span>
                    <span
                      data-letter={letter.text}
                      className={`relative inline-block ${letter.className} ${
                        letter.text === '2'
                          ? '[text-shadow:0_10px_30px_rgba(255,255,255,0.18),0_0_28px_rgba(125,215,255,0.12)]'
                          : '[text-shadow:0_10px_24px_rgba(0,0,0,0.22),0_0_18px_rgba(255,255,255,0.07)]'
                      } home-title-face transition duration-500 ease-out group-hover/title:scale-[1.02]`}
                      style={{
                        WebkitTextStroke:
                          letter.text === '2' ? '1px rgba(255,255,255,0.22)' : undefined,
                      }}
                    >
                      {letter.text}
                    </span>
                  </span>
                ))}
              </span>
            </h1>
            <AnimatedText
              className={`mt-7 block max-w-xl text-[1.08rem] leading-[1.4] text-[#fff] transition duration-300 hover:text-white sm:text-[1.28rem] ${
                isZh ? 'font-medium tracking-[0.015em]' : 'tracking-[0.01em]'
              }`}
              enableHoverHighlight
              delayMs={180}
              segments={copy.subtitleSegments}
              text={copy.subtitleSegments.map((segment) => segment.text).join('')}
            />
            <p
              className={`home-status-line mt-6 max-w-lg text-sm leading-8 text-white/48 sm:text-[15px] ${
                isZh ? 'font-medium tracking-[0.02em]' : 'tracking-[0.015em]'
              }`}
            >
              <span className="home-status-line-text">{statusLine}</span>
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-[#ff8f72]/6 blur-[90px]" />
            <div className="pointer-events-none absolute -right-10 bottom-2 h-52 w-52 rounded-full bg-[#7dd7ff]/6 blur-[100px]" />
            <div className="home-terminal-shell home-card-float home-hover-lift relative overflow-hidden rounded-[var(--home-radius-panel)] border border-white/[0.04] bg-[#081018]/38 shadow-[var(--home-shadow-soft)] backdrop-blur-xl">
              <div className="home-terminal-shell-glow pointer-events-none absolute inset-0" />
              <div className="home-terminal-shell-noise pointer-events-none absolute inset-0" />
              <div className="pointer-events-none absolute inset-y-10 left-0 w-px bg-gradient-to-b from-transparent via-cyan-200/14 to-transparent" />
              <div className="grid gap-4 p-5 lg:p-6">
                <div className="home-terminal-slogan px-1 py-1 lg:px-2">
                  <AnimatedText
                    charClassName={isZh ? 'font-sans' : 'font-mono'}
                    className={`text-lg text-white/88 sm:text-xl ${
                      isZh ? 'font-medium tracking-[0.04em] leading-[1.7]' : 'tracking-[-0.02em]'
                    }`}
                    delayMs={420}
                    enableHoverHighlight
                    segments={copy.panelTitleSegments}
                    staggerMs={28}
                    text={copy.panelTitleSegments.map((segment) => segment.text).join('')}
                  />
                </div>

                <div className="home-terminal overflow-hidden rounded-[calc(var(--home-radius-card)+0.1rem)] border border-white/[0.025]">
                  <div className="home-terminal-meta flex items-center gap-3 px-5 pb-1.5 pt-3">
                    <span className="home-signal-dot h-1.5 w-1.5 rounded-full bg-cyan-200/80" />
                    <p className="text-[10px] uppercase tracking-[0.32em] text-white/36">
                      {copy.terminalLabel}
                    </p>
                    <span className="ml-auto text-[10px] uppercase tracking-[0.28em] text-white/24">
                      {copy.terminalStatus}
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-5 pb-6 pt-4 text-sm leading-7 text-white/80">
                    <code>
                      {CODE_SAMPLE_LINES.map((line, lineIndex) => (
                        <span key={lineIndex} className="block">
                          {line.length === 0 ? (
                            <span>&nbsp;</span>
                          ) : (
                            line.map((token, tokenIndex) => (
                              <span
                                key={`${lineIndex}-${tokenIndex}`}
                                className={`home-token-hover ${token.className ?? ''} rounded px-0.5 transition duration-200 hover:bg-white/6`}
                              >
                                {token.text}
                              </span>
                            ))
                          )}
                        </span>
                      ))}
                      <span className="home-terminal-status mt-5 block font-mono text-[10px] uppercase tracking-[0.3em] text-white/24">
                        {copy.terminalSignal + ' '}
                        <span className="home-cursor inline-block h-[0.9em] w-[0.58ch] align-[-0.08em] bg-cyan-100/70" />
                      </span>
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
