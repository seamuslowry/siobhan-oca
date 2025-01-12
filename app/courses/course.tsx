import { TextContent } from '@/components/text-content';
import { type Course } from '@/utils/courses';
import Link from 'next/link';
import { Project } from './project';

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      viewBox="0 0 24 24"
      width={24}
      height={24}
    >
      <path
        fill="currentColor"
        d="M 19.980469 2.9902344 A 1.0001 1.0001 0 0 0 19.869141 3 L 15 3 A 1.0001 1.0001 0 1 0 15 5 L 17.585938 5 L 8.2929688 14.292969 A 1.0001 1.0001 0 1 0 9.7070312 15.707031 L 19 6.4140625 L 19 9 A 1.0001 1.0001 0 1 0 21 9 L 21 4.1269531 A 1.0001 1.0001 0 0 0 19.980469 2.9902344 z M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 13 A 1.0001 1.0001 0 1 0 19 13 L 19 19 L 5 19 L 5 5 L 11 5 A 1.0001 1.0001 0 1 0 11 3 L 5 3 z"
      ></path>
    </svg>
  );
}

export async function Course({
  course: { name, summary = [], syllabus, projects = [] },
  className,
}: {
  course: Course;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-center gap-2">
        <Link
          href={`/courses/${syllabus}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid grid-cols-[1fr_min-content] gap-3 items-center pb-8"
        >
          <TextContent
            value={name}
            desired={{ size: '5xl', underline: true, tag: 'h2' }}
          />
          <ExternalLinkIcon />
        </Link>
      </div>
      {summary.map((piece, index) => (
        <TextContent key={index} value={piece} />
      ))}
      {projects.map((p, i) => (
        <Project key={i} project={p} />
      ))}
    </section>
  );
}
