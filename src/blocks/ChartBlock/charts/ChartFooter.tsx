import * as React from 'react'
import { cn } from '@/utilities/ui'

interface ChartFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  dataSource?: string
}

export function ChartFooter({ dataSource, className, ...props }: ChartFooterProps) {
  if (!dataSource) return null

  return (
    <div className={cn('flex items-start gap-2 mb-6', className)} {...props}>
      {dataSource && <p className="text-sm text-muted-foreground">Source: {dataSource}</p>}
    </div>
  )
}
