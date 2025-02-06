import { type Paper as PaperType } from '@/utils/research';
import { Fragment } from 'react';
import { TextContent } from '@/components/text-content';
import Link from 'next/link';

export async function Paper({ paper }: { paper: PaperType }) {
  const authors = await paper.getAuthors();
  const link = paper.getLink();
  return (
    <div className="px-10 py-3">
      {link && (
        <Link
          target="_blank"
          href={link.href}
          prefetch={link.type === 'external'}
        >
          <TextContent
            value={paper.title}
            desired={{ bold: true, underline: true }}
          />
        </Link>
      )}
      {!link && <TextContent value={paper.title} desired={{ bold: true }} />}
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
