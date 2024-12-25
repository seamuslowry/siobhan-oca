'use client';

import ButtonLink from '@/components/ButtonLink';
import { useCallback, useState } from 'react';

export function MobileNavbarLinks() {
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(e => {
    console.log(e);
  }, []);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      <dialog
        open={open}
        onClose={() => setOpen(false)}
        onClick={handleClick}
        className="fixed top-0 left-full m-0 p-0 w-full max-w-xs h-screen bg-gray-800 text-white shadow-lg flex flex-col z-50 transform transition-transform open:-translate-x-full"
      >
        <ButtonLink href="/">Research</ButtonLink>
        <ButtonLink href="/">Teaching</ButtonLink>
        <ButtonLink href="/">News</ButtonLink>
        <ButtonLink href="/">Who</ButtonLink>
      </dialog>
    </div>
  );
}
