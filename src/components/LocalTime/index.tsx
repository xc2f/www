'use client'
import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { Locale } from '@/i18n/types'
import { useLocale } from 'next-intl'

export const formatTime = (isoTime: string | Date, _locale?: Locale): string => {
  const locale = _locale || useLocale()
  if (!isoTime) return ''

  // 2. 统一转换为 Date 对象
  const d = typeof isoTime === 'string' ? new Date(isoTime) : isoTime

  // 3. 校验日期合法性（防止 Date 构造函数传入非法字符串）
  if (isNaN(d.getTime())) return 'Invalid Date'

  // 这里的 Intl 会直接获取浏览器本地时区
  const timeString = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    // timeZoneName: 'short', // 显示时区简称，如 "GMT+8"
  }).format(d)

  return timeString
}

const LocalTimeContent = ({ time, locale }: { time: string | Date; locale?: Locale }): ReactNode =>
  formatTime(time, locale)

// 导出时禁用 SSR
export const LocalTime = dynamic(() => Promise.resolve(LocalTimeContent), {
  ssr: false,
  loading: () => 'Loading...', // 占位符
})
