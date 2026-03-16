'use client'
import { useState, useMemo } from 'react'
import { Media } from '@/components/Media'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SlideImage, SlideVideo } from 'yet-another-react-lightbox'

import ImageLightbox from './ImageLightbox'

import type { Media as MediaType } from '@/payload-types'

interface ImageGridProps {
  images: {
    id: string
    image: MediaType
  }[]
}

type BaseSlide = {
  key: string
  src: string
  width?: number
  height?: number
  alt?: string
  title?: string
  description?: string
}

type CustomImageSlide = SlideImage & BaseSlide & { type: 'image' }
type CustomVideoSlide = SlideVideo &
  BaseSlide & {
    type: 'video'
    autoPlay: true
    sources: {
      src: string
      type: string
    }[]
  }

export type MomentSlide = CustomImageSlide | CustomVideoSlide

const IMAGE_BASE_HEIGHT = 200

export default function ImageGrid({ images }: ImageGridProps) {
  const [index, setIndex] = useState(-1)

  const { photos, sliders } = useMemo(() => {
    const validItems = images.filter((i) => i.image && i.image.url)

    const processedPhotos = validItems.map((item) => ({
      ...item.image,
      key: item.id,
      aspectRatio: (item.image.width ?? 100) / (item.image.height ?? 100),
    }))

    const processedSliders: MomentSlide[] = processedPhotos.map((photo) => {
      const alt = (photo.alt || '').trim()
      const description = photo.caption
        ? convertLexicalToPlaintext({ data: photo.caption }).trim()
        : ''
      const slide: BaseSlide = {
        key: photo.key,
        src: photo.url || '',
        width: photo.width ?? undefined,
        height: photo.height ?? undefined,
        alt,
        title: alt,
        description,
      }
      if (photo.mimeType?.startsWith('video/')) {
        return {
          ...slide,
          type: 'video',
          autoPlay: true,
          sources: [
            {
              src: photo.url || '',
              type: photo.mimeType,
            },
          ],
        }
      }
      return {
        ...slide,
        type: 'image',
      }
    })

    return { photos: processedPhotos, sliders: processedSliders }
  }, [images])

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, photoIndex) => {
          const aspectRatio = photo.aspectRatio
          return (
            <div
              key={photo.key}
              className="relative overflow-hidden rounded-lg group cursor-pointer h-[160px] md:h-[200px]"
              style={{
                aspectRatio,
                flexGrow: aspectRatio,
                flexShrink: 0,
                flexBasis: `${IMAGE_BASE_HEIGHT * photo.aspectRatio}px`,
                // 限制最大宽度，防止单张图片过宽
                maxWidth: `${IMAGE_BASE_HEIGHT * aspectRatio * 1.2}px`,
              }}
              onClick={() => {
                setIndex(photoIndex)
              }}
            >
              <Media
                resource={photo}
                alt={photo.alt || ''}
                pictureClassName="mt-0 mb-0"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 flex justify-center items-center"
              />
            </div>
          )
        })}
      </div>
      <ImageLightbox index={index} open={index >= 0} close={() => setIndex(-1)} slides={sliders} />
    </>
  )
}
