import React from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'

type Props = {
  eyebrow?: React.ReactNode
  image?: MediaType | string | number | null
  meta?: React.ReactNode
  summary?: string | null
  title: string
}

export const DetailHero: React.FC<Props> = ({ eyebrow, image, meta, summary, title }) => {
  return (
    <section className="relative -mt-[10.4rem] overflow-hidden bg-[#06080A] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,143,114,0.12),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(125,215,255,0.1),transparent_36%),linear-gradient(180deg,rgba(4,7,11,0.05),rgba(4,7,11,0.24)_54%,rgba(4,7,11,0.56)_100%)]" />
      <div className="mux-grid pointer-events-none absolute inset-0 opacity-[0.18]" />
      <div className="home-noise pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="home-vignette pointer-events-none absolute inset-0 opacity-[0.96]" />

      <div className="container relative z-10 grid min-h-[92svh] items-end pb-12 pt-72 sm:min-h-[84vh] sm:pb-14 sm:pt-44 lg:grid-cols-[minmax(0,72rem)_minmax(0,1fr)] lg:pb-16 lg:pt-48">
        <div className="max-w-[72rem]">
          {eyebrow ? (
            <p className="mb-5 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-white/48">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="max-w-none text-[2.45rem] font-medium leading-[1.05] tracking-[-0.05em] text-white sm:text-[3.55rem] lg:text-[4.5rem]">
            {title}
          </h1>

          {summary ? (
            <p className="mt-6 line-clamp-4 max-w-2xl text-[1rem] leading-7 text-white/64 sm:line-clamp-3 sm:text-[1.12rem] sm:leading-8">
              {summary}
            </p>
          ) : null}

          {meta ? <div className="mt-8 text-white/72 sm:mt-10">{meta}</div> : null}
        </div>
      </div>

      <div className="absolute inset-0 min-h-[92svh] select-none sm:min-h-[84vh]">
        {image && typeof image !== 'string' && typeof image !== 'number' ? (
          <Media
            fill
            priority
            imgClassName="object-cover object-center opacity-[0.82]"
            resource={image}
            resourceSize="large"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,9,0.06),rgba(3,6,10,0.14)_26%,rgba(3,6,10,0.22)_66%,rgba(4,7,11,0.32)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,transparent_26%,rgba(3,6,10,0.04)_46%,rgba(3,6,10,0.12)_78%,rgba(3,6,10,0.22)_100%)]" />
      </div>
    </section>
  )
}
