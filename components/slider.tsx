'use client';

import clsx from 'clsx';
import { ReactNode, useCallback, useEffect, useSyncExternalStore } from 'react';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from '@/components/icons';

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

export type SliderItem = {
  content: ReactNode;
  /** Vertical items are narrow, so several can share the view at once. */
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
 * Reads a value from Embla and keeps it current as the carousel moves or
 * re-measures. `read` must return a primitive so React can compare snapshots.
 */
function useEmblaValue<T extends string | boolean>(
  embla: EmblaApi | undefined,
  read: (embla: EmblaApi) => T,
  fallback: T,
) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!embla) return () => {};
      embla.on('select', onChange).on('reInit', onChange);
      return () => {
        embla.off('select', onChange).off('reInit', onChange);
      };
    },
    [embla],
  );
  return useSyncExternalStore(
    subscribe,
    () => (embla ? read(embla) : fallback),
    () => fallback,
  );
}

/** Indices of the slides in the current scroll step, as a comma-separated list. */
const selectedSlides = (embla: EmblaApi) =>
  embla.internalEngine().slideRegistry[embla.selectedScrollSnap()].join();

/** Empty `selected` means Embla hasn't initialised yet; show every slide. */
const isSelected = (selected: string, index: number) =>
  selected === '' || selected.split(',').includes(String(index));

export default function Slider({ items }: { items: SliderItem[] }) {
  // Vertical slides are 1/3, 1/2 or full width (see the slide classes below).
  // Embla scrolls by whatever fits in the view, so a run of verticals moves
  // 3, 2 or 1 at a time and a full-width slide always stands alone.
  const [viewportRef, embla] = useEmblaCarousel({
    slidesToScroll: 'auto',
    align: 'center',
    containScroll: false,
  });

  const canScrollPrev = useEmblaValue(embla, e => e.canScrollPrev(), false);
  const canScrollNext = useEmblaValue(embla, e => e.canScrollNext(), false);
  const selected = useEmblaValue(embla, selectedSlides, '');

  // Slides stay mounted, so when the viewer moves on, pause what they left.
  // Otherwise the video keeps playing audio out of view.
  useEffect(() => {
    embla?.slideNodes().forEach((slide, i) => {
      if (!isSelected(selected, i)) {
        slide.querySelectorAll('video').forEach(video => video.pause());
      }
    });
  }, [embla, selected]);

  if (!items.length) return null;

  const hasArrows = items.length > 1;

  return (
    <div className="grid grid-cols-[min-content_1fr_min-content] md:gap-x-4 h-full">
      {hasArrows && (
        <ArrowButton
          onClick={() => embla?.scrollPrev()}
          disabled={!canScrollPrev}
          variant="left"
        />
      )}
      <div
        ref={viewportRef}
        className="col-start-2 h-full w-full overflow-hidden rounded-sm"
      >
        <div className="flex h-full items-center">
          {items.map(({ content, vertical }, i) => (
            <div
              key={i}
              className={clsx(
                // Neighbouring steps can peek into the view when a step is
                // narrower than it; fade them so only the current step shows.
                'min-w-0 shrink-0 px-2 text-center motion-safe:transition-opacity motion-safe:duration-500',
                vertical
                  ? 'basis-full md:basis-1/2 lg:basis-1/3'
                  : 'basis-full',
                !isSelected(selected, i) && 'opacity-0',
              )}
            >
              {content}
            </div>
          ))}
        </div>
      </div>
      {hasArrows && (
        <ArrowButton
          onClick={() => embla?.scrollNext()}
          disabled={!canScrollNext}
          variant="right"
        />
      )}
    </div>
  );
}
