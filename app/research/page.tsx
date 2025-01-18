import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/research';
import { Fragment } from 'react';
import { TextContent } from '@/components/text-content';
import Link from 'next/link';
import { AnyContent } from '@/components/any-content';
import Accordion from '@/components/accordion';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('research');
}

export default async function Research() {
  const { topics } = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {topics.map(({ name, description }, i) => (
          <Fragment key={i}>
            <section>
              <Accordion
                summary={
                  <TextContent
                    value={name}
                    desired={{ size: '5xl', tag: 'h2' }}
                  />
                }
              >
                <div className="grid grid-cols-[7fr_auto_3fr]">
                  <div className="mx-8 my-4 flex flex-col gap-4">
                    {description.map((v, i) => (
                      <AnyContent key={i} value={v} />
                    ))}
                  </div>
                  <div className="h-full w-px bg-graphite dark:bg-whisper-gray" />
                  <div className="my-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div className="px-10 my-6" key={i}>
                          <Link
                            href="/courses/test.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <TextContent
                              value="Really Scientific Sounding Paper Name, AI, ML, MD, PhD"
                              desired={{ bold: true, underline: true }}
                            />
                          </Link>
                          {['Student One', 'Student Two', 'Academic One'].map(
                            (name, i, arr) => (
                              <Fragment key={i}>
                                <TextContent
                                  value={name}
                                  desired={{ italic: true, tag: 'span' }}
                                />
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
            {i < topics.length - 1 && (
              <hr className="my-4 border-graphite dark:border-whisper-gray" />
            )}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
