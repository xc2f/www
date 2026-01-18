import React from 'react'
import { Chart, ChartProps } from './charts'

import type { ChartBlock as ChartBlockProps } from 'src/payload-types'

type Props = {
  className?: string
} & ChartBlockProps

export const ChartBlock: React.FC<Props> = ({ className, ...rest }) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <Chart {...(rest as ChartProps)} />
    </div>
  )
}
