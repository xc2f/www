'use client'
import { useState } from 'react'
import { Media } from '@/components/Media'
import { RenderImageContext, RenderImageProps, RowsPhotoAlbum } from 'react-photo-album'
import 'react-photo-album/rows.css'

import ImageLightbox from './ImageLightbox'

interface ImageGridProps {
  images: {
    id: string
    image: {
      url: string
      width: number
      height: number
      alt?: string
    }
  }[]
}

function NextJsImage({ alt = '' }: RenderImageProps, { photo, width, height }: RenderImageContext) {
  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Media fill src={photo} alt={alt} pictureClassName="mt-0 mb-0" />
    </div>
  )
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [index, setIndex] = useState(-1)

  const photos = images
    .filter((i) => i.image)
    .map((item) => ({
      ...item.image,
      key: item.id,
      src: item.image.url,
      width: item.image.width,
      height: item.image.height,
    }))

  return (
    <>
      <RowsPhotoAlbum
        photos={photos}
        render={{
          image: NextJsImage,
        }}
        targetRowHeight={200}
        spacing={(width) => (width < 300 ? 5 : 10)}
        onClick={({ index: current }) => setIndex(current)}
      />
      <ImageLightbox index={index} open={index >= 0} close={() => setIndex(-1)} slides={photos} />
    </>
  )
}
