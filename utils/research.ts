import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { schema as anyContentSchema } from '@/components/any-content';
import { schema as textContentSchema } from '@/components/text-content';
import { z } from 'zod';

const topicSchema = z.object({
  name: textContentSchema,
  description: z
    .array(anyContentSchema)
    .transform(arr =>
      arr.map(o =>
        typeof o === 'object' && 'filename' in o
          ? { ...o, filename: `research/${o.filename}` }
          : o,
      ),
    )
    .default([]),
});

const schema = z.object({
  topics: z.array(topicSchema),
});

export type Topic = z.infer<typeof topicSchema>;
type ResearchPageData = z.infer<typeof schema>;

export async function retrieveData(): Promise<ResearchPageData> {
  return schema.parse(
    parse(await readFile(`./public/research/content.yaml`, 'utf-8')),
  );
}
