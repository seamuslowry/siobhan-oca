import { z } from 'zod';
import { readFile } from 'fs/promises';
import { parse } from 'csv-parse';
import { parseISO } from 'date-fns/parseISO';
import { Course, retrieveData as retrieveCourseData } from '@/utils/courses';
import { Topic, retrieveData as retrieveResearchData } from '@/utils/research';

const teamMemberSchema = z.object({
  slug: z.string(),
  name: z.string(),
  type: z.literal('student').or(z.literal('faculty')),
  start: z.string().date(),
  end: z.string().date().or(z.literal('')),
  link: z.string().url().or(z.literal('')),
  summary: z.string().optional(),
});

const schema = z.array(teamMemberSchema);

type RawTeamMemberType = z.infer<typeof teamMemberSchema>;

export class TeamMember {
  slug: string;
  name: string;
  type: 'student' | 'faculty';
  start: Date;
  end?: Date;
  link?: string;
  summary?: string;

  constructor(rawTeamMember: RawTeamMemberType) {
    this.slug = rawTeamMember.slug;
    this.name = rawTeamMember.name;
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

export type TeamPageData = TeamMember[];

export async function retrieveData(): Promise<TeamPageData> {
  return schema
    .parse(
      await parse(await readFile('./public/team/members.csv', 'utf8'), {
        columns: true,
        skipEmptyLines: true,
      }).toArray(),
    )
    .map(rawMember => new TeamMember(rawMember));
}

export async function retrieveTeamMemberData(
  slug: string,
): Promise<TeamMember | undefined> {
  return (await retrieveData()).find(m => m.slug === slug);
}
