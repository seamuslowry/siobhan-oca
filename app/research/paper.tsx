import { type Paper as PaperType } from '@/utils/research';
import { Fragment } from 'react';
import { TextContent } from '@/components/text-content';

export async function Paper({ paper }: { paper: PaperType }) {
  const authors = await paper.getAuthors();
  return (
    <div className="px-10 py-3">
      <TextContent value={paper.title} desired={{ bold: true }} />
      {authors.map((author, i, arr) => (
        <Fragment key={i}>
          <TextContent
            value={typeof author === 'string' ? author : author.name}
            desired={{ tag: 'span' }}
          />
          {i < arr.length - 1 && ', '}
        </Fragment>
      ))}
    </div>
  );
}
