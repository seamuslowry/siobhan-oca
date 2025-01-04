import { readFile } from 'fs/promises';
import { parse } from 'yaml';

interface ContentConfiguration {
  courses?: string[];
}

export default async function Courses() {
  const { courses = [] }: ContentConfiguration = parse(
    await readFile(`./public/courses/content.yaml`, 'utf-8'),
  );

  return (
    <main>
      {courses.map((c, i) => (
        <p key={i}>{c}</p>
      ))}
    </main>
  );
}
