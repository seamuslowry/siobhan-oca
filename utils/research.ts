import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { z } from 'zod';

const topicSchema = z.object({
  name: z.string(),
});

const schema = z.object({
  topics: z.array(topicSchema),
});

type ResearchPageData = z.infer<typeof schema>;

export async function retrieveData(): Promise<ResearchPageData> {
  return schema.parse(
    parse(await readFile(`./public/research/content.yaml`, 'utf-8')),
  );
}
