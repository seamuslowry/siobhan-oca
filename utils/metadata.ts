import { readFile } from 'fs/promises';
import json5 from 'json5';
import type { Metadata } from 'next';

type DefinedMetadata = 'home';

export async function retrieveMetadata(
  page: DefinedMetadata,
): Promise<Metadata> {
  console.log(
    json5.parse(await readFile(`./public/${page}/metadata.json5`, 'utf-8')),
  );

  return json5.parse(
    await readFile(`./public/${page}/metadata.json5`, 'utf-8'),
  );
}
