import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { type Course as CourseType, Course } from './course';

interface ContentConfiguration {
  courses?: CourseType[];
}

export default async function Courses() {
  const { courses = [] }: ContentConfiguration = parse(
    await readFile(`./public/courses/content.yaml`, 'utf-8'),
  );

  return (
    <main>
      <div className="mx-[10%] mt-20 flex flex-col gap-8">
        {courses.map((c, i) => (
          <Course key={i} course={c} />
        ))}
      </div>
    </main>
  );
}
