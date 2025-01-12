import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { type TextContent } from '@/components/text-content';

export interface Project {
  name: string;
  collaborators?: { type: 'STUDENT' | 'ACADEMIC'; name: string }[];
  media?: { type: 'mp4' | 'image'; filename: string; alt: string }[];
  description?: TextContent[];
}

export interface Course {
  name: string;
  summary?: TextContent[];
  syllabus: string;
  projects?: Project[];
}

interface CoursePageData {
  courses: Course[];
}

export async function retrieveData(): Promise<CoursePageData> {
  return parse(await readFile(`./public/courses/content.yaml`, 'utf-8'));
}
