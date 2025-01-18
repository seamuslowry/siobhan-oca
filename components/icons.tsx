import clsx from 'clsx';

export const ArrowLeft = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={clsx('size-6', className)}
  >
    <path
      fillRule="evenodd"
      d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

export const ArrowRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={clsx('size-6', className)}
  >
    <path
      fillRule="evenodd"
      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

export const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('size-6', className)}
    viewBox="0 0 24 24"
    width={24}
    height={24}
  >
    <path
      fill="currentColor"
      d="M 19.980469 2.9902344 A 1.0001 1.0001 0 0 0 19.869141 3 L 15 3 A 1.0001 1.0001 0 1 0 15 5 L 17.585938 5 L 8.2929688 14.292969 A 1.0001 1.0001 0 1 0 9.7070312 15.707031 L 19 6.4140625 L 19 9 A 1.0001 1.0001 0 1 0 21 9 L 21 4.1269531 A 1.0001 1.0001 0 0 0 19.980469 2.9902344 z M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 13 A 1.0001 1.0001 0 1 0 19 13 L 19 19 L 5 19 L 5 5 L 11 5 A 1.0001 1.0001 0 1 0 11 3 L 5 3 z"
    ></path>
  </svg>
);

export function AnimatedExpandIcon({ open }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className="size-9">
      <rect
        x="5"
        y="11"
        width="14"
        height="2"
        rx="1"
        ry="1"
        fill="currentColor"
        className={clsx(
          'transition-transform origin-center duration-300',
          open && 'rotate-180',
        )}
      />
      <rect
        x="11"
        y="5"
        width="2"
        height="14"
        rx="1"
        ry="1"
        fill="currentColor"
        className={clsx(
          'transition-transform origin-center duration-300',
          open && 'rotate-[270deg]',
        )}
      />
    </svg>
  );
}
