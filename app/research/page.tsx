import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/research';
import Accordion from '@/components/accordion';
import { Fragment } from 'react';

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
            <Fragment key={i}>
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <p key={i}>test</p>
                ))}
            </Fragment>
          </Accordion>
        ))}
      </div>
    </main>
  );
}
