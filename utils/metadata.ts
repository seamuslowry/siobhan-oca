import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import type { Metadata } from 'next';
import { z } from 'zod';

type DefinedMetadata = 'home' | 'courses' | 'research' | 'team';

const schema = z.object({
  metadata: z
    .object({
      title: z.string(),
      description: z.string(),
    })
    // allow unspecified fields to be passed through
    .passthrough(),
});

export async function retrieveMetadata(
  page: DefinedMetadata,
): Promise<Metadata> {
  return schema.parse(
    parse(await readFile(`./public/${page}/content.yaml`, 'utf-8')),
  ).metadata;
}

export async function retrieveTeamMemberMetadata(
  slug: string,
): Promise<Metadata> {
  return schema.parse(
    parse(await readFile(`./public/team/[slug]/${slug}.yaml`, 'utf-8')),
  ).metadata;
}
