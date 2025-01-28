import { z } from 'zod';
import { readFile } from 'fs/promises';
import { parse } from 'csv-parse';
import { parseISO } from 'date-fns';
import { Course, retrieveData as retrieveCourseData } from '@/utils/courses';

const teamMemberSchema = z.object({
  slug: z.string(),
  name: z.string(),
  type: z.literal('student').or(z.literal('faculty')),
  start: z.string().date(),
  end: z.string().date().or(z.literal('')),
  link: z.string().url().or(z.literal('')),
  current: z.string().optional(),
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
  current?: string;

  constructor(rawTeamMember: RawTeamMemberType) {
    this.slug = rawTeamMember.slug;
    this.name = rawTeamMember.name;
    this.type = rawTeamMember.type;
    this.start = parseISO(rawTeamMember.start);
    this.end = rawTeamMember.end ? parseISO(rawTeamMember.end) : undefined;
    this.link = rawTeamMember.link;
    this.current = rawTeamMember.current;
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
}

export type TeamPageData = TeamMember[];

export async function retrieveData(): Promise<TeamPageData> {
  return schema
    .parse(
      await parse(await readFile('./public/team/members.csv', 'utf8'), {
        columns: true,
        skip_empty_lines: true,
      }).toArray(),
    )
    .map(rawMember => new TeamMember(rawMember));
}

export async function retrieveTeamMemberData(
  slug: string,
): Promise<TeamMember | undefined> {
  return (await retrieveData()).find(m => m.slug === slug);
}
