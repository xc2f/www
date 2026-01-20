'use client'

import React, { useState } from 'react'

import { ScatterChart, XAxis, YAxis, CartesianGrid, Scatter } from 'recharts'
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
  type: 'scatter'
  color?: string | undefined
  yAxis?: 'left' | 'right'
}

type SeriesConfigMap = Record<string, Partial<SeriesItem>>

export type ScatterChartProps = {
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

const Chart: React.FC<ScatterChartProps> = (props) => {
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
    const { key, label, yAxis = 'left' } = item
    const color = chartConfig[key]?.color || `var(--chart-${(idx % 10) + 1})`
    const hidden = hiddenKeys.has(key)

    return (
      <Scatter
        key={key}
        yAxisId={yAxis}
        dataKey={key}
        fill={color}
        stroke={color}
        hide={hidden}
        shape={(props: object) => {
          // TODO circle size
          return <circle {...props} r={2} />
        }}
      />
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ScatterChart data={dataset}>
        <CartesianGrid vertical={false} stroke="#f5f5f5" />
        <XAxis dataKey={xAxisKey} minTickGap={50} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend
          content={<ChartLegendContent onItemClick={handleLegendClick} hiddenKeys={hiddenKeys} />}
          className="cursor-pointer"
        />
        {series.map((item, idx) => renderSeries(item, idx))}
      </ScatterChart>
    </ChartContainer>
  )
}

export default Chart
