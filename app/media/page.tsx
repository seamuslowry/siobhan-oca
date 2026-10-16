import { Fragment } from 'react';
import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/media';
import { Article } from '@/app/media/article';
import Divider from '@/components/divider';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('media');
}

export default async function Media() {
  const { articles } = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {articles.map((a, i) => (
          <Fragment key={a.link}>
            <Article article={a} className="mx-[2%]" />
            {i < articles.length - 1 && <Divider />}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
