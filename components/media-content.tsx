import clsx from 'clsx';
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

export default async function MediaContent({ value }: { value: MediaContent }) {
  if (value.type === 'mp4') {
    const { filename, alt, orientation } = value;
    return (
      <Video
        controls
        preload="metadata"
        className={clsx(
          orientation === 'vertical'
            ? 'h-full aspect-[9/16]'
            : 'w-full aspect-video',
        )}
      >
        <source src={`/${filename}`} type="video/mp4" />
        {alt ?? 'Your browser does not support the video tag.'}
      </Video>
    );
  } else if (value.type === 'image') {
    const { filename, alt } = value;
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
