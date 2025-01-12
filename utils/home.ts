import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { type TextContent } from '@/components/text-content';

interface HomePageData {
  hero: {
    alt: string;
  };
  banner: {
    alt: string;
    title: string;
    email: string;
    content: TextContent[];
  };
  summary: TextContent[];
}

export async function retrieveData(): Promise<HomePageData> {
  return parse(await readFile(`./public/home/content.yaml`, 'utf-8'));
}
