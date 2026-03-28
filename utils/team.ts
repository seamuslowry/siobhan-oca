import { z } from 'zod';
import { readFile } from 'fs/promises';
import { parse as parseCsv } from 'csv-parse';
import { parse as parseYaml } from 'yaml';
import { parseISO } from 'date-fns/parseISO';
import { Course, retrieveData as retrieveCourseData } from '@/utils/courses';
import { Topic, retrieveData as retrieveResearchData } from '@/utils/research';
import { schema as textContentSchema } from '@/components/text-content';

const teamMemberSchema = z.object({
  slug: z.string(),
  name: z.string(),
  type: z
    .literal('student')
    .or(z.literal('faculty'))
    .or(z.literal('collaborator')),
  group: z.string(),
  start: z.iso.date(),
  end: z.iso.date().or(z.literal('')),
  link: z.url().or(z.literal('')),
  summary: z.string().optional(),
});

type RawTeamMemberType = z.infer<typeof teamMemberSchema>;

export class TeamMember {
  slug: string;
  name: string;
  group: string;
  type: 'student' | 'faculty' | 'collaborator';
  start: Date;
  end?: Date;
  link?: string;
  summary?: string;

  constructor(rawTeamMember: RawTeamMemberType) {
    this.slug = rawTeamMember.slug;
    this.name = rawTeamMember.name;
    this.group = rawTeamMember.group;
    this.type = rawTeamMember.type;
    this.start = parseISO(rawTeamMember.start);
    this.end = rawTeamMember.end ? parseISO(rawTeamMember.end) : undefined;
    this.link = rawTeamMember.link;
    this.summary = rawTeamMember.summary;
  }

  async getCoursework(): Promise<Course[]> {
    return (await retrieveCourseData()).courses
      .map(
        c =>
          new Course({
            ...c,
            projects: c.projects.filter(p =>
              p.collaborators.some(c => c.slug === this.slug),
            ),
          }),
      )
      .filter(c => !!c.projects.length);
  }

  async getTopics(): Promise<Topic[]> {
    return (await retrieveResearchData()).topics
      .map(
        t =>
          new Topic(
            t,
            t.papers.filter(p => p.getRawAuthors().includes(this.slug)),
          ),
      )
      .filter(t => !!t.papers.length);
  }
}

const groupSchema = z.object({
  id: z.string(),
  display: textContentSchema,
});

const contentSchema = z.object({
  groups: z.array(groupSchema),
});

type Group = z.infer<typeof groupSchema>;

export type TeamPageData = {
  members: TeamMember[];
  groups: Group[];
};

export async function retrieveData(): Promise<TeamPageData> {
  return {
    members: z
      .array(teamMemberSchema)
      .parse(
        await parseCsv(await readFile('./public/team/members.csv', 'utf8'), {
          columns: true,
          skipEmptyLines: true,
        }).toArray(),
      )
      .map(rawMember => new TeamMember(rawMember)),
    groups: contentSchema.parse(
      parseYaml(await readFile(`./public/team/content.yaml`, `utf-8`)),
    ).groups,
  };
}

export async function retrieveTeamMemberData(
  slug: string,
): Promise<TeamMember | undefined> {
  return (await retrieveData()).members.find(m => m.slug === slug);
}
