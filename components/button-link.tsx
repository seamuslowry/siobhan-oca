import Link, { type LinkProps } from 'next/link';
import clsx from 'clsx';
import { type ReactNode } from 'react';

export default function ButtonLink({
  className,
  ...rest
}: LinkProps & { className?: string } & { children: ReactNode }) {
  return (
    <Link
      {...rest}
      className={clsx(
        'supports-[hover:hover]:hover:bg-duke-light p-2 rounded',
        className,
      )}
    />
  );
}
