import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { type Course as CourseType, Course } from './course';
import { Fragment } from 'react';
import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';

interface ContentConfiguration {
  courses?: CourseType[];
}

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('courses');
}

export default async function Courses() {
  const { courses = [] }: ContentConfiguration = parse(
    await readFile(`./public/courses/content.yaml`, 'utf-8'),
  );

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {courses.map((c, i) => (
          <Fragment key={i}>
            <Course course={c} className="mx-[2%]" />
            {i < courses.length - 1 && <hr className="my-4" />}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
