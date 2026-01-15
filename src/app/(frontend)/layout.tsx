import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}
