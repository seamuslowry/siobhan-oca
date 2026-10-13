import { z } from 'zod';
import Video from '@/components/video';
import Image from 'next/image';

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

export const isVertical = (media: MediaContent) =>
  media.type === 'mp4' && media.orientation === 'vertical';

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
