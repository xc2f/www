import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { BackToTop } from '@/components/BackToTop'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import { getServerSideURL } from '@/utilities/getURL'
import { LogoFont } from '../fonts'

import { Locale } from '@/i18n/types'
import { setRequestLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { isEnabled } = await draftMode()
  const { locale } = await params

  // Enable static rendering
  setRequestLocale(locale)

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, LogoFont.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.png" rel="icon" type="image/png" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Header />
          {children}
          <BackToTop />
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'XC2F'
export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: 'xc2f.com',
  },
}
