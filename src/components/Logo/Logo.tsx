import React from 'react'
import clsx from 'clsx'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  return <span className={clsx('text-2xl font-bold font-logo')}>XC@F</span>
}
