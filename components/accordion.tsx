'use client';

import clsx from 'clsx';
import { ReactNode, useCallback, useState } from 'react';
import { AnimatedExpandIcon } from './icons';

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
        className="w-full p-3 text-left flex items-center gap-2"
        onClick={toggle}
      >
        <AnimatedExpandIcon open={open} />
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
