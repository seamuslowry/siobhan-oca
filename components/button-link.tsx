import Link, { type LinkProps } from 'next/link';
import clsx from 'clsx';
import { type ReactNode } from 'react';

export default function ButtonLink({
  className,
  ...rest
}: LinkProps & { className?: string } & { children: ReactNode }) {
  return (
    <Link
      draggable={false}
      {...rest}
      className={clsx('hover:bg-duke-light p-2 rounded select-none', className)}
    />
  );
}
