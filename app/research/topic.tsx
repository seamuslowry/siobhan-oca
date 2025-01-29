import { type Topic as TopicType } from '@/utils/research';
import { Fragment } from 'react';
import { TextContent } from '@/components/text-content';
import Link from 'next/link';
import { AnyContent } from '@/components/any-content';
import Accordion from '@/components/accordion';

export async function Topic({
  topic: { name, description, id },
}: {
  topic: TopicType;
}) {
  return (
    <section id={id} className="scroll-mt-below-header">
      <Accordion
        summary={
          <TextContent value={name} desired={{ size: '5xl', tag: 'h2' }} />
        }
      >
        <div className="grid grid-rows-[auto_auto] md:grid-cols-[7fr_auto_3fr]">
          <div className="ml-2 md:mx-8 my-4 flex flex-col gap-4">
            {description.map((v, i) => (
              <AnyContent key={i} value={v} />
            ))}
          </div>
          <div className="h-full w-px bg-graphite dark:bg-whisper-gray hidden md:block" />
          <div className="my-4 text-sm md:text-base">
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
                        <TextContent value={name} desired={{ tag: 'span' }} />
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
