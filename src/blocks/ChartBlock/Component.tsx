import React from 'react'
import { Chart, ChartProps } from './charts'

type Props = ChartProps & {
  className?: string
}

export const ChartBlock: React.FC<Props> = ({ className, ...restProps }) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <Chart {...restProps} />
    </div>
  )
}
