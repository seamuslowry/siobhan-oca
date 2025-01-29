import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import {
  type AnyContent,
  schema as anyContentSchema,
} from '@/components/any-content';
import {
  type TextContent,
  schema as textContentSchema,
} from '@/components/text-content';
import { z } from 'zod';
import kebabCase from 'lodash.kebabcase';

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

type RawTopicType = z.infer<typeof topicSchema>;
type ResearchPageData = z.infer<typeof schema>;

export class Topic {
  id: string;
  name: TextContent;
  description: AnyContent[];

  constructor(rawTopic: RawTopicType) {
    this.name = rawTopic.name;
    this.description = rawTopic.description;
    this.id = kebabCase(
      typeof this.name === 'string' ? this.name : this.name.text,
    );
  }
}

export async function retrieveData(): Promise<ResearchPageData> {
  const rawData = schema.parse(
    parse(await readFile(`./public/research/content.yaml`, 'utf-8')),
  );

  return {
    ...rawData,
    topics: rawData.topics.map(t => new Topic(t)),
  };
}
