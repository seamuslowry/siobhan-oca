import { readFile } from 'fs/promises';
import { parse as parseYaml } from 'yaml';
import { parse as parseCsv } from 'csv-parse';
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
import { retrieveTeamMemberData, TeamMember } from '@/utils/team';

const paperSchema = z.object({
  topic: z.string(),
  title: z.string(),
  altTitle: z.string(),
  type: z.enum(['conference', 'journal', 'independent']),
  authors: z.array(z.string()),
});

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

type RawPaperType = z.infer<typeof paperSchema>;
type RawTopicType = z.infer<typeof topicSchema>;

export class Paper {
  topic: string;
  title: string;
  altTitle: string;
  type: 'conference' | 'journal' | 'independent';
  #authors: string[];

  constructor(rawPaper: RawPaperType) {
    this.topic = rawPaper.topic;
    this.title = rawPaper.title;
    this.altTitle = rawPaper.altTitle;
    this.type = rawPaper.type;
    this.#authors = rawPaper.authors;
  }

  getRawAuthors(): string[] {
    return this.#authors;
  }

  async getAuthors(): Promise<(string | TeamMember)[]> {
    return Promise.all(
      this.#authors.map(a => retrieveTeamMemberData(a).then(r => r ?? a)),
    );
  }
}

export class Topic {
  id: string;
  name: TextContent;
  description: AnyContent[];
  papers: Paper[];

  constructor(rawTopic: RawTopicType, papers: Paper[]) {
    this.name = rawTopic.name;
    this.description = rawTopic.description;
    this.id = kebabCase(
      typeof this.name === 'string' ? this.name : this.name.text,
    );
    this.papers = papers.filter(p => p.topic === this.name);
  }
}

type ResearchPageData = {
  topics: Topic[];
};

export async function retrieveData(): Promise<ResearchPageData> {
  const paperData = z
    .array(paperSchema)
    .parse(
      await parseCsv(await readFile('./public/research/papers.csv', 'utf8'), {
        skip_empty_lines: true,
        relax_column_count: true,
        onRecord: r => {
          const [topic, title, altTitle, type, ...authors] = r;
          return {
            topic,
            title,
            altTitle,
            type,
            authors,
          };
        },
      }).toArray(),
    )
    .map(p => new Paper(p));
  const rawTopicData = schema.parse(
    parseYaml(await readFile(`./public/research/content.yaml`, 'utf-8')),
  );

  return {
    ...rawTopicData,
    topics: rawTopicData.topics.map(t => new Topic(t, paperData)),
  };
}
