'use client';

import clsx from 'clsx';
import { ReactNode, useCallback, useState } from 'react';

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
    <div className="w-full">
      <button className="w-full" onClick={toggle}>
        {summary}
      </button>
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
