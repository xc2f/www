import type { CollectionBeforeOperationHook } from 'payload'

import sharp from 'sharp'
import { getBackgroundForWatermark } from './getBackground'

export const addWatermark: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (operation !== 'create') {
    return args
  }
  const { file } = args.req
  if (!file || !file.mimetype.startsWith('image/')) {
    return args
  }

  const buffer = file.data
  if (!buffer) return args

  const { watermark = '© XC2F' } = req?.data || {}
  const { textColor, opacity } = await getBackgroundForWatermark(buffer, {
    position: 'bottom-right',
  })

  const svg = `
<svg width="400" height="80" xmlns="http://www.w3.org/2000/svg" style="background: red;">
  <text
    x="380"
    y="60"
    font-size="40"
    fill="${textColor}"
    fill-opacity="${opacity}"
    font-family="'Press Start 2P'"
    text-anchor="end"
    dominant-baseline="alphabetic"
  >
    ${watermark.trim()}
  </text>
</svg>
`

  // 必须先按 EXIF Orientation 物理旋转像素，再叠加水印：
  // sharp 默认输出会移除 EXIF 元数据，若此时未旋转像素，
  // 手机拍摄的照片（Orientation 6/8 等）在元数据被剥离后会显示为横躺/倒置。
  const watermarkedBuffer = await sharp(buffer)
    .autoOrient()
    .composite([
      {
        input: Buffer.from(svg),
        gravity: 'southeast',
      },
    ])
    .toBuffer()

  file.data = watermarkedBuffer

  return args
}
