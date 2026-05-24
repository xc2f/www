'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

export const HomePageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlBg = html.style.backgroundColor
    const prevBodyBg = body.style.backgroundColor
    const prevHomepage = body.dataset.homepage
    const syncTheme = () => {
      const theme = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      const backgroundColor = theme === 'dark' ? '#06080a' : '#eef3f6'

      setHeaderTheme(theme)
      html.style.backgroundColor = backgroundColor
      body.style.backgroundColor = backgroundColor
    }

    body.dataset.homepage = 'true'
    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(html, { attributeFilter: ['data-theme'] })

    return () => {
      observer.disconnect()
      setHeaderTheme(null)
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
