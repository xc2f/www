'use client'
import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { Locale } from '@/i18n/types'
import { useLocale } from 'next-intl'
import { formatTime } from '@/utilities/formatTime'

const LocalTimeContent = ({ time, locale }: { time: string | Date; locale?: Locale }): ReactNode => {
  const currentLocale = useLocale() as Locale
  return formatTime(time, locale ?? currentLocale)
}

// 导出时禁用 SSR
export const LocalTime = dynamic(() => Promise.resolve(LocalTimeContent), {
  ssr: false,
  loading: () => 'Loading...', // 占位符
})
