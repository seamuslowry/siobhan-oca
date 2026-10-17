import { z } from 'zod';
import Video from '@/components/video';
import Image from 'next/image';
import { type SliderItem } from '@/components/slider';

export const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('mp4'),
    filename: z.string(),
    alt: z.string().optional(),
    orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
  }),
  z.object({
    type: z.literal('image'),
    filename: z.string(),
    alt: z.string(),
  }),
]);

export type MediaContent = z.infer<typeof schema>;

const isVertical = (media: MediaContent) =>
  media.type === 'mp4' && media.orientation === 'vertical';

/**
 * Builds a slider item for this media. Lives here so the slot width the slider
 * reserves always matches how `MediaContent` renders the item.
 */
export const toSliderItem = (value: MediaContent): SliderItem => ({
  vertical: isVertical(value),
  content: <MediaContent value={value} />,
});

export default async function MediaContent({ value }: { value: MediaContent }) {
  const { type, filename, alt } = value;

  if (type === 'mp4') {
    return (
      <Video
        controls
        preload="metadata"
        className={
          isVertical(value)
            ? 'mx-auto w-full max-w-sm aspect-9/16'
            : 'w-full aspect-video'
        }
      >
        <source src={`/${filename}`} type="video/mp4" />
        {alt ?? 'Your browser does not support the video tag.'}
      </Video>
    );
  } else if (type === 'image') {
    return (
      <Image
        src={(await import(`@/assets/${filename}`)).default}
        alt={alt}
        placeholder="blur"
        unoptimized
      />
    );
  }

  return null;
}
