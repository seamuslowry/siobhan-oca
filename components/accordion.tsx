'use client';

import clsx from 'clsx';
import { ReactNode, useCallback, useState } from 'react';
import { ArrowRight } from './icons';

export default function Accordion({
  children,
  summary,
}: {
  children: ReactNode;
  summary: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen(o => !o), []);

  return (
    <div className="w-full bg-limestone dark:bg-graphite rounded-md">
      <button
        className="w-full p-3 text-left text-4xl flex items-center gap-2"
        onClick={toggle}
      >
        <span
          className={clsx(
            'transition-transform duration-300',
            open && 'rotate-90',
          )}
        >
          <ArrowRight className="size-8" />
        </span>
        <span>{summary}</span>
      </button>
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-scroll">{children}</div>
      </div>
    </div>
  );
}
