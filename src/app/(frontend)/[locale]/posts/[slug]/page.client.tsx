'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')

    const body = document.body
    const prevPostHero = body.dataset.postHero

    body.dataset.postHero = 'true'

    return () => {
      if (prevPostHero === undefined) {
        delete body.dataset.postHero
      } else {
        body.dataset.postHero = prevPostHero
      }
    }
  }, [setHeaderTheme])
  return <React.Fragment />
}

export default PageClient
