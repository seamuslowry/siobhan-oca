import { type Article as ArticleType } from '@/utils/media';
import { TextContent } from '@/components/text-content';
import MediaContent from '@/components/media-content';
import { ExternalLink } from '@/components/external-link';
import clsx from 'clsx';

export async function Article({
  article: { title, link, summary, media },
  className,
}: {
  article: ArticleType;
  className?: string;
}) {
  return (
    <article
      className={clsx(
        'grid gap-4',
        media && 'md:grid-cols-[3fr_7fr] items-start',
        className,
      )}
    >
      {media && <MediaContent value={media} />}
      <div className="flex flex-col gap-4">
        <ExternalLink href={link}>
          <TextContent
            value={title}
            desired={{ size: '2xl', tag: 'h2', underline: true }}
          />
        </ExternalLink>
        {summary.map((piece, i) => (
          <TextContent key={i} value={piece} />
        ))}
      </div>
    </article>
  );
}
