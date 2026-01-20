'use client'

import React from 'react'
import ComposedChart, { ComposedChartProps } from './ComposedChart'
import LineChart, { LineChartProps } from './LineChart'
import BarChart, { BarChartProps } from './BarChart'
import AreaChart, { AreaChartProps } from './AreaChart'
import ScatterChart, { ScatterChartProps } from './ScatterChart'
import PieChart, { PieChartProps } from './PieChart'
import { ChartHeader } from './ChartHeader'
import { ChartFooter } from './ChartFooter'

interface BaseChartProps {
  heading?: string
  description?: string
  dataSource?: string
}

export type ChartProps =
  | ({ type: 'composed' } & ComposedChartProps)
  | ({ type: 'line' } & LineChartProps)
  | ({ type: 'bar' } & BarChartProps)
  | ({ type: 'area' } & AreaChartProps)
  | ({ type: 'scatter' } & ScatterChartProps)
  | ({ type: 'pie' } & PieChartProps)

export const Chart: React.FC<BaseChartProps & ChartProps> = ({
  type,
  heading,
  description,
  dataSource,
  ...rest
}) => {
  let chart = null
  switch (type) {
    case 'composed':
      chart = <ComposedChart {...(rest as ComposedChartProps)} />
      break
    case 'line':
      chart = <LineChart {...(rest as LineChartProps)} />
      break
    case 'bar':
      chart = <BarChart {...(rest as BarChartProps)} />
      break
    case 'area':
      chart = <AreaChart {...(rest as AreaChartProps)} />
      break
    case 'scatter':
      chart = <ScatterChart {...(rest as ScatterChartProps)} />
      break
    case 'pie':
      chart = <PieChart {...(rest as PieChartProps)} />
      break
    default:
      break
  }

  return (
    <>
      <ChartHeader heading={heading} description={description} />
      {chart}
      <ChartFooter dataSource={dataSource} />
    </>
  )
}
