import sharp from 'sharp'

export async function getBackgroundForWatermark(
  imageBuffer: Buffer,
  options?: {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    sampleRatio?: number // 默认 0.1
  },
) {
  const { position = 'bottom-right', sampleRatio = 0.1 } = options || {}

  // 与 addWatermark 保持一致：按 EXIF 方向旋转后再取样，
  // 否则取到的是旋转前的角落，水印颜色判断会出错。
  const image = sharp(imageBuffer).autoOrient()
  const meta = await image.metadata()

  const width = meta.autoOrient?.width ?? meta.width
  const height = meta.autoOrient?.height ?? meta.height

  if (!width || !height) {
    return { luminance: 128, textColor: 'white' as const }
  }

  const regionWidth = Math.floor(width * sampleRatio)
  const regionHeight = Math.floor(height * sampleRatio)

  let left = 0
  let top = 0

  switch (position) {
    case 'bottom-right':
      left = width - regionWidth
      top = height - regionHeight
      break
    case 'bottom-left':
      left = 0
      top = height - regionHeight
      break
    case 'top-right':
      left = width - regionWidth
      top = 0
      break
    case 'top-left':
      left = 0
      top = 0
      break
  }

  const { data, info } = await image
    .extract({ left, top, width: regionWidth, height: regionHeight })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const channels = info.channels // 3 or 4
  let total = 0
  let pixels = 0

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    total += 0.2126 * r + 0.7152 * g + 0.0722 * b
    pixels++
  }

  const luminance = total / pixels

  return {
    luminance,
    textColor: luminance > 160 ? 'black' : 'white',
    opacity: luminance > 180 ? 0.4 : 0.3,
  }
}
