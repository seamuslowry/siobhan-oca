import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import type { Metadata } from 'next';

type DefinedMetadata = 'home';

export async function retrieveMetadata(
  page: DefinedMetadata,
): Promise<Metadata> {
  return parse(await readFile(`./public/${page}/content.yaml`, 'utf-8'))
    .metadata;
}
