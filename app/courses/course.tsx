import { TextContent } from '@/components/text-content';
import { type Course } from '@/utils/courses';
import Link from 'next/link';
import { Project } from './project';
import { ExternalLinkIcon } from '@/components/icons';

export async function Course({
  course: { name, summary, syllabus, projects },
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
          <ExternalLinkIcon className="size-8" />
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
