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
  const rawData = parse(await readFile(`./public/home/content.yaml`, 'utf-8'));

  return {
    hero: {
      alt: rawData?.hero?.alt ?? '',
    },
    banner: {
      alt: rawData?.banner?.alt ?? '',
      title: rawData?.banner?.title ?? '',
      email: rawData?.banner?.email ?? '',
      content: rawData?.content ?? [],
    },
    summary: rawData?.summary ?? [],
  };
}
