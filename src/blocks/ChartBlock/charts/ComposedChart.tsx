'use client'

import React from 'react'

import { ComposedChart, XAxis, YAxis, CartesianGrid, Area, Bar, Line } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type SeriesItem = {
  key: string
  label: string
  type: 'line' | 'bar' | 'area'
  color?: string | undefined
}

type SeriesConfigMap = Record<string, Partial<SeriesItem>>

export type ComposedChartProps = {
  title: string
  description?: string
  xAxisKey: string
  series: SeriesItem[]
  config?: SeriesConfigMap
  dataset: []
}

const Chart: React.FC<ComposedChartProps> = (props) => {
  const { dataset = [], xAxisKey, series = [], config = {} } = props

  const seriesConfig = series.reduce<Record<string, SeriesItem>>((prev, curr) => {
    const { key } = curr
    prev[key] = curr
    return prev
  }, {})

  const chartConfig: Record<string, SeriesItem> = {}
  for (const key in seriesConfig) {
    if (!Object.hasOwn(seriesConfig, key)) continue
    const element = seriesConfig[key]
    chartConfig[key] = {
      ...element,
      ...config?.[key],
    }
  }

  const renderSeries = (item: SeriesItem, idx: number) => {
    const { type, key, label } = item
    const color = chartConfig[key]?.color || `var(--chart-${idx + 1})`

    switch (type) {
      case 'line':
        return <Line dataKey={key} label={label} fill={color} stroke={color} type="monotone" />
      case 'bar':
        return <Bar dataKey={key} label={label} fill={color} stroke={color} radius={4} />
      case 'area':
        return <Area dataKey={key} label={label} fill={color} stroke={color} type="monotone" />

      default:
        break
    }

    return null
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ComposedChart data={dataset}>
        <CartesianGrid vertical={false} stroke="#f5f5f5" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((item, idx) => renderSeries(item, idx))}
      </ComposedChart>
    </ChartContainer>
  )
}

export default Chart
