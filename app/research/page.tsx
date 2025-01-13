import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/research';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('research');
}

export default async function Research() {
  const { topics } = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {topics.map(({ name }, i) => (
          <p key={i}>{name}</p>
        ))}
      </div>
    </main>
  );
}
