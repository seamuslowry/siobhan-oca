import { type Topic } from '@/utils/research';
import { Fragment } from 'react';
import { TextContent } from '@/components/text-content';
import Link from 'next/link';
import { AnyContent } from '@/components/any-content';
import Accordion from '@/components/accordion';
import { TeamMemberLink } from '@/components/team-member-link';

export async function Topic({
  topic: { name, description },
}: {
  topic: Topic;
}) {
  return (
    <section>
      <Accordion
        summary={
          <TextContent value={name} desired={{ size: '5xl', tag: 'h2' }} />
        }
      >
        <div className="grid grid-rows-[auto_auto_auto] md:grid-cols-[7fr_auto_3fr]">
          <div className="mx-8 my-4 flex flex-col gap-4">
            {description.map((v, i) => (
              <AnyContent key={i} value={v} />
            ))}
          </div>
          <div className="h-full w-px bg-graphite dark:bg-whisper-gray hidden md:block" />
          <hr className="my-4 mx-5 border-graphite dark:border-whisper-gray md:hidden" />
          <div className="my-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div className="px-10 py-3" key={i}>
                  <Link
                    href="/courses/test.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                  >
                    <TextContent
                      value="Really Scientific Sounding Paper Name, AI, ML, MD, PhD"
                      desired={{ bold: true, underline: true }}
                    />
                  </Link>
                  {['Student One', 'Student Two', 'Academic One'].map(
                    (name, i, arr) => (
                      <Fragment key={i}>
                        <TeamMemberLink name={name} desired={{ tag: 'span' }} />
                        {i < arr.length - 1 && ', '}
                      </Fragment>
                    ),
                  )}
                </div>
              ))}
          </div>
        </div>
      </Accordion>
    </section>
  );
}
