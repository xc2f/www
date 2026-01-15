'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useState } from 'react'

type Language = 'zh' | 'en'

const defaultLocale = 'zh'
const LOCALE_COOKIE = 'locale'

export const LanguageSelector: React.FC = () => {
  const [value, setValue] = useState(defaultLocale)

  const onlanguageChange = (language: Language) => {
    document.cookie = `${LOCALE_COOKIE}=${language || defaultLocale}; path=/; max-age=${60 * 60 * 24 * 365};`
    setValue(language)
    // TODO: 查 locale slug
    const { pathname, search } = window.location
    window.location.href = `/${language}${pathname.replace(/^\/[a-z]+(\/|$)/, '/')}${search}`
  }

  React.useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('locale='))
      ?.split('=')[1] as Language | undefined
    if (cookieLocale === 'zh' || cookieLocale === 'en') {
      setValue(cookieLocale)
    }
  }, [])

  return (
    <Select onValueChange={onlanguageChange} value={value}>
      <SelectTrigger
        aria-label="Select a language"
        className="w-auto bg-transparent gap-2 pl-0 md:pl-3 border-none"
      >
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="zh">简体中文</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  )
}
