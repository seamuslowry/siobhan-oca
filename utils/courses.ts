import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import {
  type TextContent,
  schema as textContentSchema,
} from '@/components/text-content';
import {
  type MediaContent,
  schema as mediaSchema,
} from '@/components/media-content';
import { z } from 'zod';
import kebabCase from 'lodash.kebabcase';

const collaboratorSchema = z.object({
  type: z.enum(['STUDENT', 'ACADEMIC']),
  name: textContentSchema,
  slug: z.string().optional(),
});

const projectSchema = z.object({
  name: textContentSchema,
  description: z.array(textContentSchema),
  collaborators: z.array(collaboratorSchema).default([]),
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

type RawCollaboratorType = z.infer<typeof collaboratorSchema>;
type RawProjectType = z.infer<typeof projectSchema>;
type RawCourseType = z.infer<typeof courseSchema>;

export class Project {
  name: TextContent;
  description: TextContent[];
  collaborators: RawCollaboratorType[];
  media: MediaContent[];

  constructor(rawProject: RawProjectType) {
    this.name = rawProject.name;
    this.description = rawProject.description;
    this.collaborators = rawProject.collaborators;
    this.media = rawProject.media;
  }
}

export class Course {
  id: string;
  name: string;
  syllabus: string;
  summary: TextContent[];
  projects: Project[];

  constructor(rawCourse: RawCourseType) {
    this.name = rawCourse.name;
    this.syllabus = rawCourse.syllabus;
    this.summary = rawCourse.summary;
    this.projects = rawCourse.projects.map(p => new Project(p));
    this.id = kebabCase(this.name);
  }
}

type CoursePageData = {
  courses: Course[];
};

export async function retrieveData(): Promise<CoursePageData> {
  const rawData = schema.parse(
    parse(await readFile(`./public/courses/content.yaml`, 'utf-8')),
  );

  return {
    ...rawData,
    courses: rawData.courses.map(c => new Course(c)),
  };
}
