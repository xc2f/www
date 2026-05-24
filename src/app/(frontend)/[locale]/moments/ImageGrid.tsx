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

  if (!photos.length) {
    return null
  }

  const photoCount = photos.length
  const visiblePhotos = photoCount > 3 ? photos.slice(0, 3) : photos
  const remainingCount = photoCount - 3

  const getTileClassName = (photoIndex: number) => {
    if (photoCount === 1) {
      return 'col-span-2 aspect-[4/3]'
    }

    if (photoCount === 2) {
      return 'aspect-[3/4] md:aspect-[4/5]'
    }

    if (photoIndex === 0) {
      return 'col-span-2 aspect-[4/3]'
    }

    return 'aspect-square'
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {visiblePhotos.map((photo, photoIndex) => {
          const showRemainingOverlay = photoCount > 3 && photoIndex === 2
          return (
            <div
              key={photo.key}
              className={[
                'group relative cursor-zoom-in overflow-hidden rounded-[0.9rem] bg-transparent',
                getTileClassName(photoIndex),
              ].join(' ')}
              onClick={() => {
                setIndex(photoIndex)
              }}
            >
              <Media
                fill
                resource={photo}
                alt={photo.alt || ''}
                pictureClassName="mt-0 mb-0"
                className="absolute inset-0"
                imgClassName="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0)_0%,rgba(15,23,42,0.06)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.04)_100%)]" />

              {showRemainingOverlay && (
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.12)_100%)]">
                  <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[0.78rem] font-medium tracking-[0.04em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                    +{remainingCount}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <ImageLightbox index={index} open={index >= 0} close={() => setIndex(-1)} slides={sliders} />
    </>
  )
}
