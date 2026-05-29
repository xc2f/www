import { getTranslations } from 'next-intl/server'
import React from 'react'

import { StatusPage } from './StatusPage'

export default async function NotFound() {
  const t = await getTranslations('Status.notFound')

  return (
    <StatusPage
      actionLabel={t('action')}
      code="404"
      description={t('description')}
      eyebrow={t('eyebrow')}
      title={t('title')}
    />
  )
}
