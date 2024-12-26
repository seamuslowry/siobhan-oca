'use client';

import ButtonLink from '@/components/ButtonLink';
import { MouseEventHandler, useRef } from 'react';

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

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
    <>
      <button onClick={handleOpen}>
        <MenuIcon />
      </button>
      <dialog
        ref={ref}
        onClose={handleClose}
        onClick={handleClick}
        className="backdrop:bg-gray-100/50 fixed top-0 left-full m-0 p-0 w-full max-w-xs h-screen max-h-screen bg-gray-800 text-white shadow-lg rounded-l-lg flex flex-col z-50 transform transition-transform open:-translate-x-full"
      >
        {/* ensure that the dialog contents always fill the whole clickable area; this is so we can treat 'DIALOG' clicks (the backdrop) as requests to close */}
        <div className="w-full h-full flex flex-col p-4">
          <ButtonLink onClick={handleClose} href="/">
            Research
          </ButtonLink>
          <ButtonLink onClick={handleClose} href="/">
            Teaching
          </ButtonLink>
          <ButtonLink onClick={handleClose} href="/">
            News
          </ButtonLink>
          <ButtonLink onClick={handleClose} href="/">
            Who
          </ButtonLink>
        </div>
      </dialog>
    </>
  );
}
