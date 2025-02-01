'use client';

import clsx from 'clsx';
import { Children, ReactNode, useCallback, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ArrowLeft, ArrowRight } from '@/components/icons';

const ArrowButton = ({
  disabled,
  variant,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
  variant: 'left' | 'right';
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-1 sm:p-2 md:p-4 self-center flex items-center justify-center transition duration-500 disabled:opacity-25 enabled:hover:bg-limestone dark:enabled:hover:bg-graphite rounded-full"
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
    <div className="grid grid-cols-[min-content_1fr_min-content] md:gap-x-4 h-full">
      {totalSlides > 1 && (
        <ArrowButton onClick={moveLeft} disabled={index <= 0} variant="left" />
      )}
      <div
        {...handlers}
        className={
          'h-full w-full rounded-sm overflow-hidden col-start-2 grid grid-cols-1 grid-rows-1 place-items-center'
        }
      >
        {Children.map(children, (c, i) => (
          <div
            key={i}
            className={clsx(
              'row-start-1 col-start-1 px-4 w-full text-center motion-safe:transition-transform motion-safe:duration-500',
              i > index && 'translate-x-full',
              i < index && '-translate-x-full',
            )}
          >
            {c}
          </div>
        ))}
      </div>
      {totalSlides > 1 && (
        <ArrowButton
          onClick={moveRight}
          disabled={index >= totalSlides - 1}
          variant="right"
        />
      )}
    </div>
  );
}
