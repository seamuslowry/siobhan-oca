'use client';

import clsx from 'clsx';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ArrowLeft, ArrowRight } from '@/components/icons';
import { useMediaQuery } from '@/components/use-media-query';

export type SliderItem = {
  content: ReactNode;
  /** Vertical items share a slide with their vertical neighbors. */
  vertical: boolean;
};

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
    className="p-1 sm:p-2 md:p-4 self-center flex items-center justify-center transition duration-500 disabled:opacity-25 enabled:hover:bg-limestone dark:enabled:hover:bg-graphite rounded-full cursor-pointer"
  >
    {variant === 'right' && <ArrowRight />}
    {variant === 'left' && <ArrowLeft />}
  </button>
);

/**
 * How many vertical items fit on one slide at the current viewport.
 * Keep in sync with `VERTICAL_SLOT`.
 */
function useVerticalCapacity() {
  // Tailwind's `md` and `lg` breakpoints. Default to desktop when prerendering.
  const tablet = useMediaQuery('(min-width: 48rem)', true);
  const desktop = useMediaQuery('(min-width: 64rem)', true);
  return desktop ? 3 : tablet ? 2 : 1;
}

/**
 * One vertical slot is sized in CSS rather than from `useVerticalCapacity`, so
 * the prerendered HTML is already the right size before hydration. The padding
 * stands in for a gap, so a slot is the same width alone or in a group.
 */
const VERTICAL_SLOT = 'w-full md:w-1/2 lg:w-1/3 px-2';

/**
 * Groups item indices into slides. Consecutive vertical items share a slide,
 * up to `capacity`. Every other item gets its own slide. Order is preserved.
 *
 * e.g. [V, V, H, V, V, V] at capacity 3 => [[0, 1], [2], [3, 4, 5]]
 */
function groupSlides(items: SliderItem[], capacity: number) {
  const slides: number[][] = [];
  items.forEach((item, i) => {
    const previous = slides.at(-1);
    const joinsPrevious =
      item.vertical &&
      previous &&
      items[previous[0]].vertical &&
      previous.length < capacity;

    if (joinsPrevious) previous.push(i);
    else slides.push([i]);
  });
  return slides;
}

export default function Slider({ items }: { items: SliderItem[] }) {
  const capacity = useVerticalCapacity();
  const slides = groupSlides(items, capacity);

  // Track the item in view rather than the slide, so the viewer keeps their
  // place when a resize regroups the slides.
  const [currentItem, setCurrentItem] = useState(0);
  const currentSlide = Math.max(
    slides.findIndex(slide => slide.includes(currentItem)),
    0,
  );
  const totalSlides = slides.length;

  const goTo = (slide: number) =>
    setCurrentItem(slides[Math.min(Math.max(slide, 0), totalSlides - 1)][0]);
  const moveLeft = () => goTo(currentSlide - 1);
  const moveRight = () => goTo(currentSlide + 1);

  // Off-screen slides stay mounted, so stop their videos when the viewer
  // moves on. Otherwise they keep playing audio out of view.
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    trackRef.current?.querySelectorAll('[data-slide]').forEach((slide, i) => {
      if (i !== currentSlide) {
        slide.querySelectorAll('video').forEach(video => video.pause());
      }
    });
  }, [currentSlide]);

  const handlers = useSwipeable({
    // swipe moves should be opposite of the swipe direction
    onSwipedLeft: moveRight,
    onSwipedRight: moveLeft,
    preventScrollOnSwipe: true,
  });

  if (!totalSlides) return null;

  return (
    <div
      ref={trackRef}
      className="grid grid-cols-[min-content_1fr_min-content] md:gap-x-4 h-full"
    >
      {totalSlides > 1 && (
        <ArrowButton
          onClick={moveLeft}
          disabled={currentSlide <= 0}
          variant="left"
        />
      )}
      <div
        {...handlers}
        className={
          'h-full w-full rounded-sm overflow-hidden col-start-2 grid grid-cols-1 grid-rows-1 place-items-center'
        }
      >
        {slides.map((slide, i) => (
          <div
            key={slide[0]}
            data-slide
            className={clsx(
              'row-start-1 col-start-1 px-4 w-full flex justify-center text-center motion-safe:transition-transform motion-safe:duration-500',
              i > currentSlide && 'translate-x-full',
              i < currentSlide && '-translate-x-full',
            )}
          >
            {slide.map(itemIndex => (
              <div
                key={itemIndex}
                className={items[itemIndex].vertical ? VERTICAL_SLOT : 'w-full'}
              >
                {items[itemIndex].content}
              </div>
            ))}
          </div>
        ))}
      </div>
      {totalSlides > 1 && (
        <ArrowButton
          onClick={moveRight}
          disabled={currentSlide >= totalSlides - 1}
          variant="right"
        />
      )}
    </div>
  );
}
