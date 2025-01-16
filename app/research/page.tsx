import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/research';
import Accordion from '@/components/accordion';
import { Fragment } from 'react';
import { TextContent } from '@/components/text-content';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('research');
}

export default async function Research() {
  const { topics } = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {topics.map(({ name }, i) => (
          <Accordion key={i} summary={name}>
            <div className="py-4">
              {Array(20)
                .fill(0)
                .map((_, i, arr) => (
                  <Fragment key={i}>
                    <div className="px-10">
                      <p>
                        Really Scientific Sounding Paper Name, AI, ML, MD, PhD
                      </p>
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
                    {i < arr.length - 1 && <hr className="my-4 mx-6" />}
                  </Fragment>
                ))}
            </div>
          </Accordion>
        ))}
      </div>
    </main>
  );
}
