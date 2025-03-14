'use client';

import clsx from 'clsx';
import { ReactNode, useCallback, useState } from 'react';
import { AnimatedExpandIcon } from '@/components/icons';

export default function Accordion({
  children,
  summary,
}: {
  children: ReactNode;
  summary: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  const toggle = useCallback(() => setOpen(o => !o), []);

  return (
    <div className="w-full rounded-md overflow-clip">
      <button
        className="w-full py-3 text-left grid grid-cols-1 md:grid-cols-[min-content_auto] cursor-pointer items-baseline gap-2"
        onClick={toggle}
      >
        <AnimatedExpandIcon open={open} className="hidden md:block" />
        <span>{summary}</span>
      </button>
      <div
        className={clsx(
          'grid motion-safe:transition-[grid-template-rows] motion-safe:duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
