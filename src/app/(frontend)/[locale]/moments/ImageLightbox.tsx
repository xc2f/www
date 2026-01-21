'use client'
import { RenderImageContext, RenderImageProps, RowsPhotoAlbum } from 'react-photo-album'
import {
  Lightbox,
  isImageFitCover,
  isImageSlide,
  useLightboxProps,
  useLightboxState,
  RenderSlideProps,
  SlideImage,
} from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

import { Media } from '@/components/Media'

interface Slide extends SlideImage {
  key: string
  src: string
  width?: number
  height?: number
  alt?: string
}

interface ImageLightboxProps {
  slides: Slide[]
  index: number
  open: boolean
  close: () => void
}

function isNextJsImage(
  slide: SlideImage,
): slide is Required<Pick<SlideImage, 'width' | 'height'>> & SlideImage {
  return isImageSlide(slide) && typeof slide.width === 'number' && typeof slide.height === 'number'
}

function NextJsImage({ slide, offset, rect }: RenderSlideProps<SlideImage>) {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps()
  const { currentIndex } = useLightboxState()

  if (!isNextJsImage(slide)) return undefined

  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit)
  const width = !cover
    ? Math.round(Math.min(rect.width, (rect.height / slide.height) * slide.width))
    : rect.width
  const height = !cover
    ? Math.round(Math.min(rect.height, (rect.width / slide.width) * slide.height))
    : rect.height

  return (
    <div style={{ position: 'relative', width, height }}>
      <Media
        fill
        alt={slide.alt}
        src={slide}
        onClick={offset === 0 ? () => click?.({ index: currentIndex }) : undefined}
      />
    </div>
  )
}

export default function ImageLightbox({ slides, index, open, close }: ImageLightboxProps) {
  return (
    <Lightbox
      index={index}
      slides={slides}
      open={open}
      close={close}
      render={{ slide: NextJsImage }}
    />
  )
}
