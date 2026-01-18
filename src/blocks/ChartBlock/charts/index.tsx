'use client'

import React from 'react'
import ComposedChart, { ComposedChartProps } from './ComposedChart'

export type ChartProps =
  | ({ type: 'composed' } & ComposedChartProps)
  | { type: 'line' | 'bar' | 'area' | 'pie' }

export const Chart: React.FC<ChartProps> = ({ type, ...rest }) => {
  switch (type) {
    case 'composed':
      return <ComposedChart {...(rest as ComposedChartProps)} />
    default:
      return null
  }
}
