import type { Block } from 'payload'

export const ChartBlock = (options?: { slug?: string; label?: string }): Block => {
  return {
    slug: options?.slug ?? 'chart',
    interfaceName: 'ChartBlock',
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'title',
            type: 'text',
            label: 'Chart Title',
            required: true,
            admin: { width: '50%' },
          },
          {
            name: 'description',
            type: 'text',
            label: 'Description',
            admin: { width: '50%' },
          },
        ],
      },
      {
        name: 'type',
        label: 'Chart Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Line', value: 'line' },
          { label: 'Bar', value: 'bar' },
          { label: 'Area', value: 'area' },
          { label: 'Pie', value: 'pie' },
          { label: 'Composed', value: 'composed' },
        ],
        defaultValue: 'line',
      },

      // Dataset JSON
      {
        name: 'dataset',
        label: 'Dataset (JSON)',
        type: 'json',
        required: true,
        admin: {
          description: '数组对象格式，例如: [{ "time": "1:51", "Seoul": 97, "Tokyo": 86 }]',
        },
        validate: (value) => {
          if (!Array.isArray(value)) return 'Dataset 必须是数组'
          if (value.length === 0) return 'Dataset 不能为空'
          return true
        },
      },

      {
        name: 'xAxisKey',
        type: 'text',
        label: 'X轴字段名',
        required: true,
      },
      {
        name: 'series',
        label: 'Series 配置',
        type: 'array',
        minRows: 1,
        fields: [
          {
            name: 'key',
            type: 'text',
            label: '字段名',
            required: true,
          },
          {
            name: 'label',
            type: 'text',
            label: '显示名称',
          },
          {
            name: 'type',
            type: 'select',
            label: 'Series 类型',
            options: [
              { label: 'Line', value: 'line' },
              { label: 'Bar', value: 'bar' },
              { label: 'Area', value: 'area' },
            ],
            defaultValue: 'line',
          },
          {
            name: 'yAxis',
            type: 'select',
            label: 'Y轴位置',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Right', value: 'right' },
            ],
            defaultValue: 'left',
          },
          {
            name: 'color',
            type: 'text',
            label: '颜色',
            admin: { description: '可填十六进制或 color 名称' },
          },
        ],
      },

      // 高级 Chart 配置
      {
        name: 'config',
        label: 'Advanced Chart Options (JSON)',
        type: 'json',
        admin: {
          description: '透传给图表库的原生配置项',
        },
      },

      // 数据来源
      {
        name: 'dataSource',
        type: 'text',
        label: 'Data Source',
        defaultValue: 'xc2f.com',
      },
    ],
  }
}
