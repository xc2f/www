import React from 'react'

type SearchArchiveIntroProps = {
  children: React.ReactNode
  description: string
  descriptionSecondLine: string
  eyebrow: string
  title: string
}

export function SearchArchiveIntro({
  children,
  description,
  descriptionSecondLine,
  eyebrow,
  title,
}: SearchArchiveIntroProps) {
  return (
    <section className="search-archive-intro relative isolate overflow-hidden bg-white text-slate-950 dark:bg-black dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f7_18%,#e6edf4_42%,#e8eef5_68%,#f2f5f8_86%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#000000_0%,#050a10_18%,#0a121a_42%,#0b131b_62%,#070b10_84%,#000000_100%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(255,143,114,0.08),transparent_24%),radial-gradient(circle_at_82%_20%,rgba(125,215,255,0.09),transparent_26%),radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.32),transparent_34%)] dark:bg-[radial-gradient(circle_at_16%_24%,rgba(255,143,114,0.08),transparent_26%),radial-gradient(circle_at_82%_20%,rgba(125,215,255,0.09),transparent_30%),radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.025),transparent_34%)]" />

      <div className="home-atmosphere home-atmosphere-drift-a pointer-events-none absolute -left-[18%] top-[0%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(255,143,114,0.05),transparent_72%)] opacity-36 dark:bg-[radial-gradient(circle,rgba(255,143,114,0.055),transparent_72%)] dark:opacity-45" />

      <div className="home-atmosphere home-atmosphere-drift-b pointer-events-none absolute right-[-20%] top-[8%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(125,215,255,0.065),transparent_72%)] opacity-34 dark:bg-[radial-gradient(circle,rgba(125,215,255,0.06),transparent_74%)] dark:opacity-42" />

      <div className="pointer-events-none absolute inset-x-[10%] top-[30%] h-[10rem] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.38),transparent_74%)] opacity-68 blur-[48px] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_74%)] dark:opacity-65" />

      <div className="mux-grid pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.1]" />
      <div className="home-noise pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" />
      <div className="home-vignette pointer-events-none absolute inset-0 opacity-[0.16] dark:opacity-[0.72]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-90">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/62 to-transparent dark:from-black dark:via-black/62" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_52%_-8%,rgba(255,255,255,0.88),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.92),transparent_30%)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(0,0,0,0.95),transparent_28%),radial-gradient(circle_at_52%_-8%,rgba(0,0,0,0.88),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(0,0,0,0.92),transparent_30%)] blur-[18px]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-90">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/46 to-transparent dark:from-black dark:via-black/46" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_100%,rgba(255,255,255,0.96),transparent_34%),radial-gradient(circle_at_48%_108%,rgba(255,255,255,0.82),transparent_42%),radial-gradient(circle_at_84%_100%,rgba(255,255,255,0.94),transparent_36%)] dark:bg-[radial-gradient(circle_at_12%_100%,rgba(0,0,0,0.96),transparent_34%),radial-gradient(circle_at_48%_108%,rgba(0,0,0,0.82),transparent_42%),radial-gradient(circle_at_84%_100%,rgba(0,0,0,0.94),transparent_36%)] blur-[24px]" />
      </div>

      <div className="container relative z-10 pb-4 pt-16 sm:pb-4 sm:pt-20 lg:pb-4 lg:pt-24">
        <div className="grid grid-cols-4 gap-x-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-6 xl:gap-x-7">
          <div className="col-span-4 md:col-span-5 lg:col-span-7 xl:col-span-6">
            <p className="posts-archive-intro-eyebrow font-mono text-[0.7rem] uppercase tracking-[0.34em]">
              {eyebrow}
            </p>

            <div className="mt-6">
              <h1 className="posts-archive-intro-title max-w-3xl text-[clamp(2.35rem,6vw,4.25rem)] font-medium leading-[0.94] tracking-[-0.055em]">
                {title}
              </h1>

              <p className="posts-archive-intro-description mt-5 max-w-2xl text-[0.98rem] leading-7 sm:text-[1.02rem]">
                <span className="block">{description}</span>
                <span className="posts-archive-intro-description-secondary mt-1.5 block">
                  {descriptionSecondLine}
                </span>
              </p>
            </div>
          </div>

          <div className="col-span-4 mt-9 md:col-span-5 lg:col-span-7 lg:mt-10 xl:col-span-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
