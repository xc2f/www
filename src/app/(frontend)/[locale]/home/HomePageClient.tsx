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
    const prevNoScroll = body.dataset.noScroll

    html.style.backgroundColor = '#02050b'
    body.style.backgroundColor = '#02050b'
    body.dataset.homepage = 'true'
    body.dataset.noScroll = 'true'

    return () => {
      html.style.backgroundColor = prevHtmlBg
      body.style.backgroundColor = prevBodyBg

      if (prevHomepage === undefined) {
        delete body.dataset.homepage
      } else {
        body.dataset.homepage = prevHomepage
      }

      if (prevNoScroll === undefined) {
        delete body.dataset.noScroll
      } else {
        body.dataset.noScroll = prevNoScroll
      }
    }
  }, [setHeaderTheme])

  return null
}
