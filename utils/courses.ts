import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { schema as textContentSchema } from '@/components/text-content';
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
    .array(
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal('mp4'),
          filename: z.string(),
          alt: z.string().optional(),
        }),
        z.object({
          type: z.literal('image'),
          filename: z.string(),
          alt: z.string(),
        }),
      ]),
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
