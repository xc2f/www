'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

export const HomePageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')

    const html = document.documentElement
    const body = document.body
    const prevHtmlBg = html.style.backgroundColor
    const prevBodyBg = body.style.backgroundColor

    html.style.backgroundColor = '#02050b'
    body.style.backgroundColor = '#02050b'

    return () => {
      html.style.backgroundColor = prevHtmlBg
      body.style.backgroundColor = prevBodyBg
    }
  }, [setHeaderTheme])

  return null
}
