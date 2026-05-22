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
    const prevHomepage = body.dataset.homepage

    html.style.backgroundColor = '#06080a'
    body.style.backgroundColor = '#06080a'
    body.dataset.homepage = 'true'

    return () => {
      html.style.backgroundColor = prevHtmlBg
      body.style.backgroundColor = prevBodyBg

      if (prevHomepage === undefined) {
        delete body.dataset.homepage
      } else {
        body.dataset.homepage = prevHomepage
      }
    }
  }, [setHeaderTheme])

  return null
}
