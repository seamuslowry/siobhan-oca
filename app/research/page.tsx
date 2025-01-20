import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/research';
import { Fragment } from 'react';
import { Topic } from '@/app/research/topic';

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
            {i < topics.length - 1 && (
              <hr className="my-4 border-graphite dark:border-whisper-gray" />
            )}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
