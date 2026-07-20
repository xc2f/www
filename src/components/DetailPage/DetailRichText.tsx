import React from 'react'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import RichText from '@/components/RichText'

type Props = {
  data: DefaultTypedEditorState
}

export const detailRichTextClassName =
  'relative mx-auto max-w-[50rem] text-[1.02rem] leading-8 text-foreground/88 dark:text-white/82 [&_a]:text-foreground [&_a]:decoration-black/20 [&_a]:underline-offset-4 hover:[&_a]:decoration-black/45 dark:[&_a]:text-white dark:[&_a]:decoration-white/20 dark:hover:[&_a]:decoration-white/45 [&_blockquote]:border-l-[#7dd7ff]/55 [&_blockquote]:bg-[#7dd7ff]/[0.04] [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:italic dark:[&_blockquote]:bg-white/[0.03] [&_h1]:mt-12 [&_h1]:text-[2.2rem] [&_h1]:font-medium [&_h1]:tracking-[-0.04em] [&_h1]:text-foreground dark:[&_h1]:text-white [&_h2]:mt-14 [&_h2]:text-[1.7rem] [&_h2]:font-medium [&_h2]:tracking-[-0.035em] [&_h2]:text-foreground dark:[&_h2]:text-white [&_h3]:mt-10 [&_h3]:text-[1.3rem] [&_h3]:font-medium [&_h3]:tracking-[-0.03em] [&_h3]:text-foreground dark:[&_h3]:text-white [&_hr]:my-10 [&_hr]:border-black/8 dark:[&_hr]:border-white/[0.08] [&_img]:rounded-[1.25rem] [&_img]:shadow-[0_18px_48px_rgba(15,23,42,0.14)] dark:[&_img]:shadow-[0_22px_60px_rgba(0,0,0,0.34)] [&_li]:marker:text-muted-foreground dark:[&_li]:marker:text-white/34 [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:bg-[#071019] [&_pre]:shadow-[0_18px_52px_rgba(0,0,0,0.3)] [&_strong]:font-medium [&_strong]:text-foreground dark:[&_strong]:text-white [&_ul]:space-y-2'

export const DetailRichText: React.FC<Props> = ({ data }) => {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-black/[0.045] bg-white/72 px-6 py-8 shadow-[0_8px_24px_rgba(15,23,42,0.035)] backdrop-blur-[6px] sm:px-10 sm:py-12 lg:px-12 dark:border-white/[0.045] dark:bg-[linear-gradient(180deg,rgba(8,13,18,0.72),rgba(6,10,15,0.84))] dark:shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_16%,rgba(15,23,42,0)_84%,rgba(15,23,42,0.015))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0)_18%,rgba(125,215,255,0.012)_100%)]" />
      <RichText className={detailRichTextClassName} data={data} enableGutter={false} />
    </div>
  )
}
