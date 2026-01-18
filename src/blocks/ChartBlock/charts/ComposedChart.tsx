'use client'

import React, { useState } from 'react'

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
  xAxisKey: string
  series: SeriesItem[]
  config?: SeriesConfigMap
  dataset: []
}

type LegendItem = {
  dataKey?: string | number
  value?: string
  color?: string
}

const Chart: React.FC<ComposedChartProps> = (props) => {
  const { dataset = [], xAxisKey, series = [], config = {} } = props
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set())

  const handleLegendClick = (item: LegendItem) => {
    if (!item.dataKey) return

    setHiddenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(item.dataKey as string)) {
        next.delete(item.dataKey as string)
      } else {
        next.add(item.dataKey as string)
      }
      return next
    })
  }

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
    const color = chartConfig[key]?.color || `var(--chart-${(idx % 10) + 1})`
    const hidden = hiddenKeys.has(key)

    switch (type) {
      case 'line':
        return (
          <Line
            dataKey={key}
            label={label}
            fill={color}
            stroke={color}
            type="monotone"
            dot={false}
            strokeWidth={2}
            connectNulls={true}
            hide={hidden}
          />
        )
      case 'bar':
        return (
          <Bar dataKey={key} label={label} fill={color} stroke={color} radius={4} hide={hidden} />
        )
      case 'area': {
        const id = `colorLatency_${key}`
        return [
          <defs key={id}>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="35%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>,
          <Area
            key={key}
            dataKey={key}
            label={label}
            fill={`url(#${id})`}
            stroke={color}
            strokeWidth={0}
            type="monotone"
            hide={hidden}
          />,
        ]
      }

      default:
        break
    }

    return null
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ComposedChart data={dataset}>
        <CartesianGrid vertical={false} stroke="#f5f5f5" />
        <XAxis
          dataKey={xAxisKey}
          // 修改刻度文字的颜色、字号等
          tick={{ fill: 'var(--border)' }}
          // 修改轴线本身的颜色
          axisLine={{ stroke: '#ccc' }}
          // 修改刻度线（小短线）的颜色
          tickLine={{ stroke: '#ccc' }}
        />
        <YAxis axisLine={false} tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend
          content={<ChartLegendContent onItemClick={handleLegendClick} hiddenKeys={hiddenKeys} />}
          className="cursor-pointer"
        />
        {series.map((item, idx) => renderSeries(item, idx))}
      </ComposedChart>
    </ChartContainer>
  )
}

export default Chart
