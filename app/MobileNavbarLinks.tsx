'use client';

import ButtonLink from '@/components/ButtonLink';
import { MouseEventHandler, useRef } from 'react';

export function MobileNavbarLinks() {
  const ref = useRef<HTMLDialogElement>(null);

  const handleOpen = () => ref.current?.showModal();
  const handleClose = () => ref.current?.close();

  const handleClick: MouseEventHandler<HTMLDialogElement> = e => {
    if ('nodeName' in e.target && e.target.nodeName === 'DIALOG') {
      handleClose();
    }
  };

  return (
    <div>
      <button onClick={handleOpen}>Open</button>
      <dialog
        ref={ref}
        onClose={handleClose}
        onClick={handleClick}
        className="fixed top-0 left-full m-0 p-0 w-full max-w-xs h-screen bg-gray-800 text-white shadow-lg flex flex-col z-50 transform transition-transform open:-translate-x-full"
      >
        {/* ensure that the dialog contents always fill the whole clickable area; this is so we can treat 'DIALOG' clicks (the backdrop) as requests to close */}
        <div className="w-full h-full flex flex-col p-4">
          <ButtonLink href="/">Research</ButtonLink>
          <ButtonLink href="/">Teaching</ButtonLink>
          <ButtonLink href="/">News</ButtonLink>
          <ButtonLink href="/">Who</ButtonLink>
        </div>
      </dialog>
    </div>
  );
}
