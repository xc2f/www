'use client'

import React from 'react'

import { PieChart, Pie, Cell, PieLabelRenderProps } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart'

type PieItem = {
  data: {
    color?: string
  }[]
  innerRadius: string
  outerRadius: string
}

export type PieChartProps = {
  config?: ChartConfig
  dataset: PieItem[]
  pieConfig: {
    nameKey: string
    valueKey: string
  }
}

const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius: _innerRadius,
    outerRadius: _outerRadius,
    percent,
    name,
  } = props
  const innerRadius = parseFloat(_innerRadius as string)
  const outerRadius = parseFloat(_outerRadius as string)

  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null
  }

  const RADIAN = Math.PI / 180

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const ncx = Number(cx)
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN)
  const ncy = Number(cy)
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
      <tspan x={x} fontWeight="bold">
        {name}
      </tspan>
      <tspan x={x} dy="1.4em" fontSize="10">
        {`${((percent ?? 1) * 100).toFixed(0)}%`}
      </tspan>
    </text>
  )
}

const Chart: React.FC<PieChartProps> = (props) => {
  const { dataset = [], config = {}, pieConfig } = props
  const { nameKey, valueKey } = pieConfig

  const renderSeries = (pie: PieItem, index: number) => {
    const { data, innerRadius = '0', outerRadius = '100%' } = pie

    return (
      <Pie
        key={`pie_${index}`}
        data={data}
        dataKey={valueKey}
        nameKey={nameKey}
        labelLine={false}
        label={renderCustomizedLabel}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
      >
        {data.map((item, idx) => (
          <Cell key={`cell-${idx}`} fill={item?.color || `var(--chart-${(idx % 10) + 1})`} />
        ))}
      </Pie>
    )
  }

  return (
    <ChartContainer config={config} className="min-h-[200px] max-h-[300px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        {/* TODO 优化Legend */}
        {/* <ChartLegend
          content={<ChartLegendContent onItemClick={handleLegendClick} hiddenKeys={hiddenKeys} />}
          className="cursor-pointer"
        /> */}
        {dataset.map(renderSeries)}
      </PieChart>
    </ChartContainer>
  )
}

export default Chart
