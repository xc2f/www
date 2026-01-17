'use client'

import React from 'react'
import ComposedChart, { ComposedChartProps } from './ComposedChart'

export type ChartProps =
  | ({ type: 'composed' } & ComposedChartProps)
  | { type: 'line' | 'bar' | 'area' | 'pie' }

export const Chart: React.FC<ChartProps> = (props) => {
  switch (props.type) {
    case 'composed':
      return <ComposedChart {...props} />
  }
  return null
}
