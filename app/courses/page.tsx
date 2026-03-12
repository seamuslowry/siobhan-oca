import { Course } from '@/app/courses/course';
import { Fragment } from 'react';
import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/courses';
import Divider from '@/components/divider';
import { TextContent } from '@/components/text-content';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('courses');
}

export default async function Courses() {
  const { courses, summary } = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {summary.map((piece, index) => (
          <TextContent key={index} value={piece} />
        ))}
        {!!summary.length && <Divider />}
        {courses.map((c, i) => (
          <Fragment key={i}>
            <Course course={c} className="mx-[2%]" />
            {i < courses.length - 1 && <Divider />}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
