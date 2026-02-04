import * as React from 'react'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'

interface ChartFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  dataSource?: string
}

export function ChartFooter({ dataSource, className, ...props }: ChartFooterProps) {
  const t = useTranslations('Posts')
  if (!dataSource) return null

  return (
    <div className={cn('flex items-start gap-2 mb-6', className)} {...props}>
      {dataSource && (
        <p className="text-sm text-muted-foreground">
          {t('source')}: {dataSource}
        </p>
      )}
    </div>
  )
}
