import { type Paper as PaperType } from '@/utils/research';
import { Fragment } from 'react';
import { TextContent } from '@/components/text-content';
import Link from 'next/link';

export async function Paper({ paper }: { paper: PaperType }) {
  const authors = await paper.getAuthors();
  return (
    <div className="px-10 py-3">
      <Link
        href="/courses/test.pdf"
        target="_blank"
        rel="noopener noreferrer"
        prefetch={false}
      >
        <TextContent
          value={paper.title}
          desired={{ bold: true, underline: true }}
        />
      </Link>
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
