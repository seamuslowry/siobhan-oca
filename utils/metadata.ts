import { readFile } from 'fs/promises';
import type { Metadata } from 'next';

type DefinedMetadata = 'default';

const DEFINED_METADATA_KEYS = ['title', 'description'] as const;

export async function retrieveMetadata(
  page: DefinedMetadata,
): Promise<Metadata> {
  return DEFINED_METADATA_KEYS.reduce<Promise<Metadata>>(
    async (acc, curr) => ({
      ...(await acc),
      [curr]: await readFile(`./public/metadata/${page}/${curr}.txt`, 'utf8'),
    }),
    Promise.resolve({}),
  );
}
