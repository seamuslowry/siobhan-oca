'use client';

import ButtonLink from '@/components/button-link';
import { type Route } from '@/utils/routes';
import { Fragment, MouseEventHandler, useRef } from 'react';

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="w-6 h-6"
      width={24}
      height={24}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

const firstValidHref = (r: Route): string =>
  'href' in r ? r.href : firstValidHref(r.routes[0]);

function MobileNavbarLink({
  route,
  onClick,
  className,
}: {
  route: Route;
  onClick: VoidFunction;
  className?: string;
}) {
  return 'href' in route ? (
    <ButtonLink onClick={onClick} href={route.href} className={className}>
      {route.text}
    </ButtonLink>
  ) : (
    <Fragment>
      <MobileNavbarLink
        route={{ text: route.text, href: firstValidHref(route) }}
        onClick={onClick}
      />
      <div className="flex flex-col pl-4">
        {route.routes.map(innerRoute => (
          <MobileNavbarLink
            key={innerRoute.text}
            route={innerRoute}
            onClick={onClick}
          />
        ))}
      </div>
    </Fragment>
  );
}

export function MobileNavbarLinks({ routes }: { routes: Route[] }) {
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
      <button className="cursor-pointer" onClick={handleOpen}>
        <MenuIcon />
      </button>
      <dialog
        ref={ref}
        onClose={handleClose}
        onClick={handleClick}
        className="backdrop:bg-gray-100/50 fixed top-0 left-full m-0 p-0 w-full max-w-xs h-screen max-h-screen text-white bg-duke-dark shadow-lg rounded-l-lg flex flex-col z-50 transition-transform open:-translate-x-full"
      >
        {/* ensure that the dialog contents always fill the whole clickable area; this is so we can treat 'DIALOG' clicks (the backdrop) as requests to close */}
        <div className="w-full h-full flex flex-col p-4">
          {routes.map(r => (
            <MobileNavbarLink key={r.text} route={r} onClick={handleClose} />
          ))}
        </div>
      </dialog>
    </>
  );
}
