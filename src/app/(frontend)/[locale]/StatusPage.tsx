'use client'

import Link from 'next/link'
import React from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

type StatusPageProps = {
  actionLabel: string
  code: string
  description: string
  eyebrow: string
  reset?: () => void
  resetLabel?: string
  title: string
}

export function StatusPage({
  actionLabel,
  code,
  description,
  eyebrow,
  reset,
  resetLabel,
  title,
}: StatusPageProps) {
  return (
    <main
      className="relative isolate flex min-h-[calc(100svh-8rem)] flex-1 items-center overflow-hidden bg-white pt-20 text-slate-950 dark:bg-black dark:text-white sm:pt-10"
      data-status-page
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f6f8fb_0%,#e9eff5_34%,#f7fafc_100%)] dark:bg-[linear-gradient(180deg,#000000_0%,#050a10_36%,#000000_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(255,143,114,0.09),transparent_28%),radial-gradient(circle_at_82%_24%,rgba(125,215,255,0.1),transparent_30%),radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.34),transparent_34%)] dark:bg-[radial-gradient(circle_at_18%_26%,rgba(255,143,114,0.08),transparent_28%),radial-gradient(circle_at_82%_24%,rgba(125,215,255,0.085),transparent_32%),radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.025),transparent_34%)]" />
      <div className="home-atmosphere home-atmosphere-drift-a pointer-events-none absolute -left-[18%] top-[4%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(255,143,114,0.05),transparent_72%)] opacity-40 dark:bg-[radial-gradient(circle,rgba(255,143,114,0.055),transparent_72%)] dark:opacity-45" />
      <div className="home-atmosphere home-atmosphere-drift-b pointer-events-none absolute right-[-20%] top-[12%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(125,215,255,0.065),transparent_72%)] opacity-38 dark:bg-[radial-gradient(circle,rgba(125,215,255,0.06),transparent_74%)] dark:opacity-42" />
      <div className="mux-grid pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.1]" />
      <div className="home-noise pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" />
      <div className="home-vignette pointer-events-none absolute inset-0 opacity-[0.16] dark:opacity-[0.72]" />

      <section className="container relative z-10 py-24">
        <div className="grid grid-cols-4 gap-x-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-6 xl:gap-x-7">
          <div className="col-span-4 sm:col-span-8 lg:col-span-11 xl:col-span-10">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-slate-500 dark:text-[rgb(255_255_255/.42)]">
              {eyebrow}
            </p>

            <div className="mt-7 flex flex-col gap-6">
              <div className="flex flex-col items-start gap-3">
                <span
                  className={cn(
                    'font-mono text-[clamp(3.4rem,12vw,8.5rem)] font-semibold leading-[0.82] tracking-normal',
                    'text-slate-900/10 [-webkit-text-stroke:1px_rgba(15,23,42,0.18)]',
                    'dark:text-white/[0.035] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.18)]',
                  )}
                >
                  {code}
                </span>
                <h1 className="max-w-5xl text-[clamp(2.25rem,5.8vw,4.25rem)] font-medium leading-[0.95] tracking-[-0.055em] xl:whitespace-nowrap">
                  {title}
                </h1>
              </div>

              <p className="max-w-5xl text-[0.98rem] leading-7 text-slate-600 dark:text-[rgb(255_255_255/.62)] sm:text-[1.04rem] xl:whitespace-nowrap">
                {description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  className="gap-2 border border-sky-500/20 bg-slate-950/[0.88] text-white shadow-[0_0_24px_rgb(125_215_255/.10)] hover:border-sky-500/28 hover:bg-slate-900 dark:border-[rgb(255_255_255/.12)] dark:bg-[rgb(255_255_255/.055)] dark:text-[rgb(248_251_255/.88)] dark:shadow-[0_0_28px_rgb(125_215_255/.055)] dark:hover:border-[rgb(125_215_255/.22)] dark:hover:bg-[rgb(255_255_255/.085)] dark:hover:text-[rgb(255_255_255/.96)]"
                >
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    {actionLabel}
                  </Link>
                </Button>

                {reset && resetLabel ? (
                  <Button
                    className="gap-2 border-white/10 bg-transparent text-slate-700 hover:bg-slate-950/5 dark:text-[rgb(255_255_255/.58)] dark:hover:bg-[rgb(255_255_255/.08)] dark:hover:text-[rgb(255_255_255/.76)]"
                    onClick={reset}
                    type="button"
                    variant="ghost"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {resetLabel}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
