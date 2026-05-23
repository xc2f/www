'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/utilities/ui'
import { SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

type SearchProps = {
  className?: string
  defaultValue?: string
}

export const Search: React.FC<SearchProps> = ({ className, defaultValue = '' }) => {
  const t = useTranslations('Search')
  const locale = useLocale()
  const [value, setValue] = useState(defaultValue)
  const router = useRouter()

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    const nextQuery = debouncedValue.trim()
    router.replace(`/${locale}/search${nextQuery ? `?q=${encodeURIComponent(nextQuery)}` : ''}`, {
      scroll: false,
    })
  }, [debouncedValue, locale, router])

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  return (
    <div className={cn('w-full', className)}>
      <form
        className="group relative overflow-hidden rounded-[1.15rem] border border-slate-200/90 bg-white/72 px-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm transition duration-300 focus-within:border-slate-400 focus-within:bg-white/88 focus-within:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03] dark:focus-within:border-white/24 dark:focus-within:bg-white/[0.05] dark:focus-within:shadow-[0_20px_48px_rgba(0,0,0,0.2)]"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.45),rgba(255,255,255,0))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
        <Label htmlFor="search" className="sr-only">
          {t('search')}
        </Label>
        <div className="relative flex items-center gap-2">
          <div className="flex h-12 w-10 shrink-0 items-center justify-center text-slate-400 transition-colors duration-300 group-focus-within:text-slate-600 dark:text-white/24 dark:group-focus-within:text-white/48">
            <SearchIcon className="h-[0.9rem] w-[0.9rem]" strokeWidth={1.7} />
          </div>

          <Input
            id="search"
            className="h-12 rounded-none border-0 bg-transparent px-0 py-0 text-[0.98rem] text-slate-950 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white/90 dark:placeholder:text-white/24"
            onChange={(event) => {
              setValue(event.target.value)
            }}
            placeholder={t('enter')}
            value={value}
          />
        </div>
        <button type="submit" className="sr-only">
          {t('submit')}
        </button>
      </form>
    </div>
  )
}
