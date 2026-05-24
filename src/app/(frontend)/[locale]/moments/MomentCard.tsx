import ImageGrid from './ImageGrid'
import RichText from '@/components/RichText'
import { LocalTime } from '@/components/LocalTime'
import { useLocale } from 'next-intl'
import Mood from './Mood'
import { Locale } from '@/i18n/types'
import type { MomentFeedItem } from './MomentsFeed'

interface MomentCardProps {
  moment: MomentFeedItem
}

export default function MomentCard({ moment }: MomentCardProps) {
  const locale: Locale = useLocale() as Locale
  const hasImages = moment.images.length > 0

  return (
    <article className="relative py-8 sm:py-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2.5rem_minmax(0,1fr)] md:gap-6 lg:gap-8">
        <div className="relative hidden md:block">
          <div className="absolute bottom-0 left-1/2 top-[0.15rem] w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(148,163,184,0),rgba(148,163,184,0.22)_8%,rgba(148,163,184,0.22)_92%,rgba(148,163,184,0))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.1)_8%,rgba(255,255,255,0.1)_92%,rgba(255,255,255,0))]" />
          <div className="absolute left-1/2 top-[0.65rem] h-3 w-3 -translate-x-1/2 rounded-full border border-slate-300 bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.96)] dark:border-white/10 dark:bg-[#11161d] dark:shadow-[0_0_0_4px_rgba(6,8,10,0.82)]" />
        </div>

        <div className="relative">
          <div
            className={[
              'grid gap-6 lg:gap-10',
              hasImages ? 'xl:grid-cols-[minmax(0,1fr)_minmax(16rem,0.82fr)] xl:items-start' : '',
            ].join(' ')}
          >
            <div className={hasImages ? 'space-y-5 xl:order-1' : 'max-w-3xl space-y-5'}>
              <div className="flex min-h-8 flex-wrap items-center gap-x-4 gap-y-2 text-[0.82rem] text-slate-400 dark:text-white/34">
                {moment.publishedAt && (
                  <time className="font-mono tracking-[0.08em]">
                    <LocalTime time={moment.publishedAt} locale={locale} />
                  </time>
                )}
                {moment.mood && <Mood mood={moment.mood} />}
              </div>

          {moment.title && (
            <h2 className="max-w-2xl text-[1.8rem] font-medium tracking-[-0.04em] text-slate-950 dark:text-white sm:text-[2rem]">
              {moment.title}
            </h2>
          )}

              {moment.content && (
                <RichText
                  data={moment.content}
                  enableGutter={false}
                  className="max-w-none prose-p:my-0 prose-p:text-[1rem] prose-p:leading-8 prose-headings:text-slate-950 prose-strong:text-slate-900 prose-a:text-slate-900 prose-a:decoration-slate-300 prose-a:underline-offset-4 dark:prose-headings:text-white dark:prose-strong:text-white dark:prose-p:text-white/66 dark:prose-a:text-white dark:prose-a:decoration-white/20"
                />
              )}
            </div>

            {hasImages && (
              <div className="xl:order-2">
                <ImageGrid images={moment.images} />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
