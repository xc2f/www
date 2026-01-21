import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { Locale } from '@/i18n/types'

const LocalTimeContent = ({
  date,
  locale = 'en',
}: {
  date: string | Date
  locale: Locale
}): ReactNode => {
  if (!date) return ''

  // 2. 统一转换为 Date 对象
  const d = typeof date === 'string' ? new Date(date) : date

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

// 导出时禁用 SSR
export const LocalTime = dynamic(() => Promise.resolve(LocalTimeContent), {
  ssr: false,
  loading: () => 'Loading...', // 占位符
})
