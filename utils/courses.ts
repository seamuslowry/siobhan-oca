import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { schema as textContentSchema } from '@/components/text-content';
import { schema as mediaSchema } from '@/components/media-content';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string(),
  description: z.array(textContentSchema),
  collaborators: z
    .array(
      z.object({
        type: z.enum(['STUDENT', 'ACADEMIC']),
        name: textContentSchema,
      }),
    )
    .default([]),
  media: z
    .array(mediaSchema)
    .transform(arr =>
      arr.map(o => ({ ...o, filename: `courses/${o.filename}` })),
    )
    .default([]),
});

const courseSchema = z.object({
  name: z.string(),
  syllabus: z.string(),
  summary: z.array(textContentSchema),
  projects: z.array(projectSchema).default([]),
});

const schema = z.object({
  courses: z.array(courseSchema),
});

export type Project = z.infer<typeof projectSchema>;
export type Course = z.infer<typeof courseSchema>;

type CoursePageData = z.infer<typeof schema>;

export async function retrieveData(): Promise<CoursePageData> {
  return schema.parse(
    parse(await readFile(`./public/courses/content.yaml`, 'utf-8')),
  );
}
