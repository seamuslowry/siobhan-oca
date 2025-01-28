import { TextContent } from '@/components/text-content';
import { type Course as CourseType } from '@/utils/courses';
import { Project } from '@/app/courses/project';
import clsx from 'clsx';
import { ExternalLink } from '@/components/external-link';

export async function Course({
  course: { name, summary, syllabus, projects, id },
  className,
}: {
  course: CourseType;
  className?: string;
}) {
  return (
    <section className={clsx(className, 'scroll-mt-32')} id={id}>
      <ExternalLink
        href={`/courses/${syllabus}`}
        prefetch={false}
        className="pb-8 text-5xl"
      >
        <TextContent
          value={name}
          desired={{ size: '5xl', underline: true, tag: 'h2' }}
        />
      </ExternalLink>
      {summary.map((piece, index) => (
        <TextContent key={index} value={piece} />
      ))}
      {projects.map((p, i) => (
        <Project key={i} project={p} />
      ))}
    </section>
  );
}
