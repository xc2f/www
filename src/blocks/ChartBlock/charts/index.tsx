'use client'

import React from 'react'
import ComposedChart, { ComposedChartProps } from './ComposedChart'
import { ChartHeader } from './ChartHeader'

interface BaseChartProps {
  heading?: string
  description?: string
}

export type ChartProps =
  | ({ type: 'composed' } & ComposedChartProps)
  | { type: 'line' | 'bar' | 'area' | 'pie' }

export const Chart: React.FC<BaseChartProps & ChartProps> = ({
  type,
  heading,
  description,
  ...rest
}) => {
  let chart = null
  switch (type) {
    case 'composed':
      chart = <ComposedChart {...(rest as ComposedChartProps)} />
      break
    default:
      break
  }

  return (
    <>
      <ChartHeader heading={heading} description={description} />
      {chart}
    </>
  )
}
