import { type ReactNode } from 'react';
import Link, { type LinkProps } from 'next/link';
import { ExternalLinkIcon } from '@/components/icons';
import clsx from 'clsx';

export async function ExternalLink({
  children,
  className,
  ...rest
}: LinkProps & { className?: string } & { children: ReactNode }) {
  return (
    <Link
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        'grid grid-cols-[1fr_min-content] gap-3 items-center w-fit',
        className,
      )}
      {...rest}
    >
      {children}
      <ExternalLinkIcon />
    </Link>
  );
}
