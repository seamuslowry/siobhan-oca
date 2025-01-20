import { z } from 'zod';
import { readdir, readFile } from 'fs/promises';
import { parse } from 'yaml';
import path from 'path';

const rawTeamMemberSchema = z.object({
  name: z.string(),
});

const teamMemberSchema = rawTeamMemberSchema.extend({
  slug: z.string(),
});

const schema = z.array(teamMemberSchema);

export type TeamMember = z.infer<typeof teamMemberSchema>;

export type TeamPageData = z.infer<typeof schema>;

export async function retrieveData(): Promise<TeamPageData> {
  return schema.parse(
    await Promise.all(
      (
        await readdir('./public/team/[slug]', {
          withFileTypes: true,
        })
      )
        .filter(e => e.isFile())
        .map(e => e.name)
        .map(filename =>
          retrieveTeamMemberData(
            path.basename(filename, path.extname(filename)),
          ),
        ),
    ),
  );
}

export async function retrieveTeamMemberData(
  slug: string,
): Promise<TeamMember> {
  return teamMemberSchema.parse({
    slug,
    ...rawTeamMemberSchema.parse(
      parse(await readFile(`./public/team/[slug]/${slug}.yaml`, 'utf-8')),
    ),
  });
}
