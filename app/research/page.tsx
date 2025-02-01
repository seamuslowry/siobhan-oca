import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/research';
import { Fragment } from 'react';
import { Topic } from '@/app/research/topic';
import Divider from '@/components/divider';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('research');
}

export default async function Research() {
  const { topics } = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {topics.map((topic, i) => (
          <Fragment key={i}>
            <Topic topic={topic} />
            {i < topics.length - 1 && <Divider />}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
