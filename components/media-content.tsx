import { z } from 'zod';
import Video from '@/components/video';
import Image from 'next/image';

export const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('mp4'),
    filename: z.string(),
    alt: z.string().optional(),
  }),
  z.object({
    type: z.literal('image'),
    filename: z.string(),
    alt: z.string(),
  }),
]);

export type MediaContent = z.infer<typeof schema>;

export default async function MediaContent({
  value: { type, filename, alt },
}: {
  value: MediaContent;
}) {
  if (type === 'mp4') {
    return (
      <Video controls preload="metadata" className="w-full aspect-video">
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
