'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'

import { StatusPage } from './StatusPage'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('Status.error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPage
      actionLabel={t('action')}
      code="500"
      description={t('description')}
      eyebrow={t('eyebrow')}
      reset={reset}
      resetLabel={t('reset')}
      title={t('title')}
    />
  )
}
