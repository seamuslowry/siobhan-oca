import { Course } from '@/app/courses/course';
import { Fragment } from 'react';
import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/courses';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('courses');
}

export default async function Courses() {
  const { courses } = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {courses.map((c, i) => (
          <Fragment key={i}>
            <Course course={c} className="mx-[2%]" />
            {i < courses.length - 1 && (
              <hr className="my-4 border-graphite dark:border-whisper-gray" />
            )}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
