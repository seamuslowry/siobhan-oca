import { schema as textContentSchema } from '@/components/text-content';
import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { z } from 'zod';

const schema = z.object({
  hero: z.object({
    alt: z.string(),
  }),
  banner: z.object({
    alt: z.string(),
    title: z.string(),
    email: z.string(),
    content: z.array(textContentSchema),
  }),
  summary: z.array(textContentSchema),
});

type HomePageData = z.infer<typeof schema>;

export async function retrieveData(): Promise<HomePageData> {
  return schema.parse(
    parse(await readFile(`./public/home/content.yaml`, 'utf-8')),
  );
}
