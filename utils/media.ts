import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import {
  type TextContent,
  schema as textContentSchema,
} from '@/components/text-content';
import {
  type MediaContent,
  schema as mediaSchema,
} from '@/components/media-content';
import { z } from 'zod';

const articleSchema = z.object({
  title: textContentSchema,
  link: z.url(),
  summary: z.array(textContentSchema).default([]),
  media: mediaSchema
    .transform(o => ({ ...o, filename: `media/${o.filename}` }))
    .optional(),
});

const schema = z.object({
  articles: z.array(articleSchema),
});

export type Article = {
  title: TextContent;
  link: string;
  summary: TextContent[];
  media?: MediaContent;
};

type MediaPageData = {
  articles: Article[];
};

export async function retrieveData(): Promise<MediaPageData> {
  return schema.parse(
    parse(await readFile(`./public/media/content.yaml`, 'utf-8')),
  );
}
