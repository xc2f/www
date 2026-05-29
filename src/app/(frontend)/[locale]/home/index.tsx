import type { RequiredDataFromCollectionSlug } from 'payload'

import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { AnimatedText } from './AnimatedText.client'
import { HomePageClient } from './HomePageClient'

type HomePageProps = {
  draft: boolean
  page: RequiredDataFromCollectionSlug<'pages'>
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
    { text: 'const', className: 'text-[var(--home-code-keyword)]' },
    { text: ' ' },
    { text: 'signal', className: 'text-[var(--home-code-primary)]' },
    { text: ' = ', className: 'text-[var(--home-code-muted)]' },
    { text: 'await', className: 'text-[var(--home-code-function)]' },
    { text: ' ' },
    { text: 'xc2f', className: 'text-[var(--home-code-object)]' },
    { text: '.form', className: 'text-[var(--home-code-primary)]' },
    { text: '({', className: 'text-[var(--home-code-muted)]' },
  ],
  [
    { text: '  ' },
    { text: 'phase', className: 'text-[var(--home-code-property)]' },
    { text: ': ', className: 'text-[var(--home-code-muted)]' },
    { text: "'forming'", className: 'text-[var(--home-code-string)]' },
    { text: ',', className: 'text-[var(--home-code-muted)]' },
  ],
  [
    { text: '  ' },
    { text: 'presence', className: 'text-[var(--home-code-property)]' },
    { text: ': ', className: 'text-[var(--home-code-muted)]' },
    { text: "'detected'", className: 'text-[var(--home-code-string)]' },
    { text: ',', className: 'text-[var(--home-code-muted)]' },
  ],
  [{ text: '})', className: 'text-[var(--home-code-muted)]' }],
  [],
  [
    { text: 'resolve', className: 'text-[var(--home-code-function)]' },
    { text: '(', className: 'text-[var(--home-code-muted)]' },
    { text: 'signal', className: 'text-[var(--home-code-primary)]' },
    { text: ')', className: 'text-[var(--home-code-muted)]' },
  ],
]

const TITLE_LETTERS = [
  {
    text: 'X',
    className: 'rotate-[-8deg] home-title-tone-x',
    ghostClassName: '-translate-x-[0.04em] translate-y-[0.03em] text-[#ff8f72]/55',
  },
  {
    text: 'C',
    className: 'translate-y-[0.1em] rotate-[6deg] home-title-tone-c',
    ghostClassName: 'translate-x-[0.03em] -translate-y-[0.02em] text-white/35',
  },
  {
    text: '2',
    className: 'scale-[1.1] -rotate-[4deg] home-title-tone-2',
    ghostClassName: '-translate-x-[0.03em] translate-y-[0.04em] text-[#7dd7ff]/45',
  },
  {
    text: 'F',
    className: '-translate-y-[0.08em] rotate-[-5deg] home-title-tone-f',
    ghostClassName: 'translate-x-[0.035em] translate-y-[0.02em] text-white/30',
  },
] as const

export async function HomePage({ draft, page }: HomePageProps) {
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
    panelTitleSegments: t('panel') ? [{ text: t('panel') }] : [],
  }
  const statusLine = t('statusLine')

  return (
    <main
      className="relative flex min-h-0 flex-1 items-start overflow-hidden bg-[var(--home-page-bg)] text-[var(--home-page-fg)] lg:items-center"
      data-homepage
    >
      <HomePageClient />
      {draft && <LivePreviewListener />}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: 'var(--home-top-fade)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: 'var(--home-bottom-fade)' }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--home-scene-overlay)' }}
      />
      <div
        className="home-atmosphere home-atmosphere-drift-a pointer-events-none absolute -left-[16%] top-[2%] h-[56rem] w-[54rem] rounded-full opacity-60"
        style={{ background: 'var(--home-atmosphere-coral)' }}
      />
      <div
        className="home-atmosphere home-atmosphere-drift-b pointer-events-none absolute right-[-20%] top-[14%] h-[60rem] w-[56rem] rounded-full opacity-56"
        style={{ background: 'var(--home-atmosphere-cyan)' }}
      />
      <div
        className="home-haze home-haze-drift home-light-breathe pointer-events-none absolute inset-x-[8%] top-[14%] h-[24rem] opacity-45"
        style={{ background: 'var(--home-haze-glow)' }}
      />
      <div
        className="home-bridge-haze pointer-events-none absolute left-[36%] top-[30%] h-[18rem] w-[28rem] opacity-60"
        style={{ background: 'var(--home-bridge-glow)' }}
      />
      <div
        className="mux-grid pointer-events-none absolute inset-0"
        style={{ opacity: 'var(--home-grid-opacity)' }}
      />
      <div
        className="home-noise pointer-events-none absolute inset-0"
        style={{ opacity: 'var(--home-noise-opacity)' }}
      />
      <div
        className="home-vignette pointer-events-none absolute inset-0"
        style={{ opacity: 'var(--home-vignette-opacity)' }}
      />

      <section className="home-hero-shell relative mx-auto w-full max-w-6xl px-6 pb-44 sm:px-8 sm:pb-32 lg:px-10 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.04fr)_minmax(340px,0.88fr)] lg:items-center lg:gap-12">
          <div className="max-w-2xl lg:pt-4">
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
                          letter.text === '2' ? '1px var(--home-title-2-stroke)' : undefined,
                      }}
                    >
                      {letter.text}
                    </span>
                  </span>
                ))}
              </span>
            </h1>
            <AnimatedText
              className={`mt-7 block max-w-xl text-[1.08rem] leading-[1.4] text-[var(--home-subtitle-color)] transition duration-300 hover:text-[var(--home-page-fg)] sm:text-[1.28rem] ${
                isZh ? 'font-medium tracking-[0.015em]' : 'tracking-[0.01em]'
              }`}
              enableHoverHighlight
              delayMs={180}
              segments={copy.subtitleSegments.map((segment) => ({
                ...segment,
                highlightClassName:
                  segment.highlightClassName != null
                    ? `${segment.highlightClassName} home-inline-highlight`
                    : undefined,
              }))}
              text={copy.subtitleSegments.map((segment) => segment.text).join('')}
            />
            <p
              className={`home-status-line mt-6 max-w-lg text-sm leading-8 text-[var(--home-status-muted)] sm:text-[15px] ${
                isZh ? 'font-medium tracking-[0.02em]' : 'tracking-[0.015em]'
              }`}
            >
              <span className="home-status-line-text">{statusLine}</span>
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-[#ff8f72]/6 blur-[90px]" />
            <div className="pointer-events-none absolute -right-10 bottom-2 h-52 w-52 rounded-full bg-[#7dd7ff]/6 blur-[100px]" />
            <div className="home-terminal-shell home-card-float relative overflow-hidden rounded-[var(--home-radius-panel)] border shadow-[var(--home-shadow-soft)] backdrop-blur-xl">
              <div className="home-terminal-shell-glow pointer-events-none absolute inset-0" />
              <div className="home-terminal-shell-noise pointer-events-none absolute inset-0" />
              <div className="home-terminal-shell-outline pointer-events-none absolute inset-0" />
              <div className="home-terminal-rail pointer-events-none absolute inset-y-10 left-0 w-px" />
              <div className="grid gap-0">
                {copy.panelTitleSegments.length > 0 && (
                  <div className="home-terminal-slogan px-5 pt-5 lg:px-6 lg:pt-6">
                    <AnimatedText
                      charClassName={isZh ? 'font-sans' : 'font-mono'}
                      className={`text-lg text-[var(--home-terminal-heading)] sm:text-xl ${
                        isZh ? 'font-medium tracking-[0.04em] leading-[1.7]' : 'tracking-[-0.02em]'
                      }`}
                      delayMs={420}
                      enableHoverHighlight
                      segments={copy.panelTitleSegments}
                      staggerMs={28}
                      text={copy.panelTitleSegments.map((segment) => segment.text).join('')}
                    />
                  </div>
                )}

                <div className="home-terminal overflow-hidden rounded-[calc(var(--home-radius-card)+0.1rem)] border">
                  <div className="home-terminal-meta flex items-center gap-2 px-4 pb-1 pt-[0.8rem] sm:gap-3 sm:px-[1.35rem]">
                    <span className="home-signal-dot h-1.5 w-1.5 shrink-0 rounded-full" />
                    <p className="min-w-0 flex-1 truncate whitespace-nowrap text-[9px] uppercase tracking-[0.16em] text-[var(--home-terminal-meta)] sm:text-[10px] sm:tracking-[0.32em]">
                      {copy.terminalLabel}
                    </p>
                    <span className="ml-auto shrink-0 -translate-y-[0.02rem] whitespace-nowrap text-[9px] uppercase tracking-[0.14em] text-[var(--home-terminal-status-muted)] sm:text-[10px] sm:tracking-[0.28em]">
                      {copy.terminalStatus}
                    </span>
                  </div>
                  <pre className="home-terminal-code overflow-x-auto px-[1.45rem] pb-[1.6rem] pt-[1.05rem] text-sm leading-7">
                    <code>
                      {CODE_SAMPLE_LINES.map((line, lineIndex) => (
                        <span key={lineIndex} className="block">
                          {line.length === 0 ? (
                            <span>&nbsp;</span>
                          ) : (
                            line.map((token, tokenIndex) => (
                              <span
                                key={`${lineIndex}-${tokenIndex}`}
                                className={`home-token-hover ${token.className ?? ''} rounded px-0.5 transition duration-200`}
                              >
                                {token.text}
                              </span>
                            ))
                          )}
                        </span>
                      ))}
                      <span className="home-terminal-status mt-[1.45rem] block font-mono text-[10px] uppercase tracking-[0.42em]">
                        {copy.terminalSignal + ' '}
                        <span className="home-cursor inline-block h-[0.9em] w-[0.58ch] align-[-0.08em]" />
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
