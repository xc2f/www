import * as React from 'react'
import { cn } from '@/utilities/ui'

interface ChartHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

export function ChartHeader({
  heading,
  description,
  actions,
  className,
  ...props
}: ChartHeaderProps) {
  if (!heading && !description && !actions) return null

  return (
    <div className={cn('flex items-start gap-2 mb-6', className)} {...props}>
      <div className="flex flex-col gap-1">
        {heading && <h3 className="text-base font-semibold leading-none">{heading}</h3>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  )
}
