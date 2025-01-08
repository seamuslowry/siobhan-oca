'use client';

import clsx from 'clsx';
import { Children, ReactNode, useCallback, useState } from 'react';
import { useSwipeable } from 'react-swipeable';

const ArrowLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-6"
  >
    <path
      fillRule="evenodd"
      d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-6"
  >
    <path
      fillRule="evenodd"
      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowButton = ({
  disabled,
  variant,
  onClick,
  className,
}: {
  disabled?: boolean;
  onClick: () => void;
  variant: 'left' | 'right';
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      'p-1 self-center flex items-center justify-center transition duration-500 enabled:hover:bg-gradient-to-r disabled:opacity-25 h-full',
      variant === 'left' &&
        'enabled:hover:from-limestone enabled:hover:dark:from-graphite enabled:hover:to-transparent rounded-l-xl',
      variant === 'right' &&
        'enabled:hover:to-limesone enabled:hover:dark:to-graphite enabled:hover:from-transparent rounded-r-xl',
      className,
    )}
  >
    {variant === 'right' && <ArrowRight />}
    {variant === 'left' && <ArrowLeft />}
  </button>
);

export default function Slider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);

  const totalSlides = Children.count(children);

  const moveLeft = useCallback(() => setIndex(c => Math.max(c - 1, 0)), []);
  const moveRight = useCallback(
    () => setIndex(c => Math.min(c + 1, totalSlides - 1)),
    [totalSlides],
  );

  const handlers = useSwipeable({
    // swipe moves should be opposite of the swipe direction
    onSwipedLeft: moveRight,
    onSwipedRight: moveLeft,
    preventScrollOnSwipe: true,
  });

  if (!totalSlides) return null;

  return (
    <div className="grid grid-cols-[min-content_1fr_min-content] gap-x-4 md:gap-x-12 h-full">
      <ArrowButton
        onClick={moveLeft}
        disabled={index <= 0}
        variant="left"
        className="col-start-1 row-start-1 z-10"
      />
      <div
        {...handlers}
        className={
          'h-full w-full rounded overflow-hidden row-start-1 col-start-1 col-span-3 grid grid-cols-1 grid-rows-1 place-items-center'
        }
      >
        {Children.map(children, (c, i) => (
          <div
            key={i}
            className={clsx(
              'row-start-1 col-start-1 p-8 w-full text-center transition-transform duration-500',
              i > index && 'translate-x-full',
              i < index && '-translate-x-full',
            )}
          >
            {c}
          </div>
        ))}
      </div>
      <ArrowButton
        onClick={moveRight}
        disabled={index >= totalSlides - 1}
        variant="right"
        className="col-start-3 row-start-1 z-10"
      />
    </div>
  );
}
