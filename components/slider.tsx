'use client';

import clsx from 'clsx';
import {
  Children,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSwipeable } from 'react-swipeable';
import { ArrowLeft, ArrowRight } from '@/components/icons';
import { IsActiveContext } from '@/components/video';

export type SliderItem = {
  orientation: 'horizontal' | 'vertical';
  node: ReactNode;
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

// Pure: pack consecutive vertical items into one slide up to `capacity`,
// breaking on every horizontal. YAML order is preserved.
//
//   [V, V, V] @ 3       -> [[V, V, V]]
//   [V, V, V] @ 2       -> [[V, V], [V]]
//   [V, V, V] @ 1       -> [[V], [V], [V]]
//   [V, V, H, V, V, V]  -> [[V, V], [H], [V, V, V]] @ 3
//   [V, V, V, V] @ 3    -> [[V, V, V], [V]]
//   [H, H] @ 3          -> [[H], [H]]
function groupItems(items: SliderItem[], capacity: number): SliderItem[][] {
  const slides: SliderItem[][] = [];
  let current: SliderItem[] = [];
  for (const item of items) {
    if (item.orientation === 'horizontal') {
      if (current.length) {
        slides.push(current);
        current = [];
      }
      slides.push([item]);
    } else {
      current.push(item);
      if (current.length === capacity) {
        slides.push(current);
        current = [];
      }
    }
  }
  if (current.length) slides.push(current);
  return slides;
}

// Defaults to desktop capacity for the SSR / pre-hydration render. After
// hydration, a matchMedia listener keeps it in sync with the viewport.
function useCapacity(): { capacity: number; hydrated: boolean } {
  const [capacity, setCapacity] = useState(3);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect
      setHydrated(true);
      return;
    }

    const lg = window.matchMedia('(min-width: 1024px)');
    const md = window.matchMedia('(min-width: 768px)');

    const compute = () => (lg.matches ? 3 : md.matches ? 2 : 1);

    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setCapacity(compute());
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setHydrated(true);

    const update = () => setCapacity(compute());
    lg.addEventListener('change', update);
    md.addEventListener('change', update);
    return () => {
      lg.removeEventListener('change', update);
      md.removeEventListener('change', update);
    };
  }, []);

  return { capacity, hydrated };
}

function SlideGroup({
  group,
  isActive,
}: {
  group: SliderItem[];
  isActive: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Within-slide play mutex: when one video starts, pause every other video
  // in this slide. Scoped to this slide's DOM subtree only.
  useEffect(() => {
    if (group.length < 2) return;
    const root = ref.current;
    if (!root) return;
    const videos = Array.from(root.querySelectorAll('video'));
    if (videos.length < 2) return;

    const handlers = videos.map(v => {
      const handler = () => {
        for (const other of videos) {
          if (other !== v && !other.paused) other.pause();
        }
      };
      v.addEventListener('play', handler);
      return [v, handler] as const;
    });
    return () => {
      for (const [v, handler] of handlers) {
        v.removeEventListener('play', handler);
      }
    };
  }, [group.length]);

  const isMulti = group.length > 1;

  return (
    <div
      ref={ref}
      className={clsx(
        'h-full w-full',
        isMulti && 'grid place-items-center gap-4',
        isMulti && group.length === 2 && 'grid-cols-2',
        isMulti && group.length === 3 && 'grid-cols-3',
      )}
    >
      <IsActiveContext value={isActive}>
        {group.map((item, i) => (
          <Fragment key={i}>{item.node}</Fragment>
        ))}
      </IsActiveContext>
    </div>
  );
}

export default function Slider({
  children,
  items: providedItems,
}: {
  children?: ReactNode;
  items?: SliderItem[];
}) {
  // When `items` isn't supplied, fall back to the legacy children-as-slides
  // path: each child becomes a horizontal item (so it gets its own slide).
  // Preserves the public API for any future caller; the courses page passes
  // `items` directly.
  const items = useMemo<SliderItem[]>(() => {
    if (providedItems) return providedItems;
    return Children.toArray(children).map(node => ({
      orientation: 'horizontal' as const,
      node,
    }));
  }, [providedItems, children]);

  const { capacity, hydrated } = useCapacity();

  const slides = useMemo(() => groupItems(items, capacity), [items, capacity]);

  const totalSlides = slides.length;
  const [index, setIndex] = useState(0);
  // Track the first-item index of the current slide so we can keep the
  // viewer on the same content when the breakpoint changes the grouping.
  const firstItemIndexRef = useRef(0);

  useEffect(() => {
    if (!slides.length) return;
    // Find the slide containing the previously-current first item; clamp to
    // the last slide if the new grouping is shorter than the previous index.
    let target = slides.length - 1;
    let cumulative = 0;
    for (let i = 0; i < slides.length; i++) {
      const len = slides[i].length;
      if (
        firstItemIndexRef.current >= cumulative &&
        firstItemIndexRef.current < cumulative + len
      ) {
        target = i;
        break;
      }
      cumulative += len;
    }
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setIndex(target);
  }, [slides]);

  // Keep firstItemIndexRef in sync with the active slide so a subsequent
  // capacity change can preserve position relative to the user's view.
  useEffect(() => {
    if (!slides[index]) return;
    let cumulative = 0;
    for (let i = 0; i < index; i++) cumulative += slides[i].length;
    firstItemIndexRef.current = cumulative;
  }, [index, slides]);

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

  // Container aspect rule: 16:9 by default; 9:16 when phone capacity AND
  // any item is vertical, so verticals on phone fill the slide width
  // instead of becoming a postage stamp inside a 16:9 box.
  const hasVertical = items.some(i => i.orientation === 'vertical');
  const containerAspect =
    capacity === 1 && hasVertical ? 'aspect-[9/16]' : 'aspect-video';

  // Pre-hydration: render the same outer grid frame as the real slider, but
  // with empty arrow cells and a skeleton in the slide column. Keeps slide
  // column width stable across the hydration boundary; the arrow buttons
  // and container aspect may shift after hydration but the page does not
  // jump from a fundamentally different layout.
  if (!hydrated) {
    return (
      <div className="grid grid-cols-[min-content_1fr_min-content] md:gap-x-4 h-full">
        <div />
        <div
          className={clsx(
            'col-start-2 w-full rounded-sm overflow-hidden',
            containerAspect,
            'animate-pulse bg-limestone/60 dark:bg-graphite/30 rounded-lg',
          )}
        />
        <div />
      </div>
    );
  }

  if (!totalSlides) return null;

  return (
    <div className="grid grid-cols-[min-content_1fr_min-content] md:gap-x-4 h-full">
      {totalSlides > 1 && (
        <ArrowButton onClick={moveLeft} disabled={index <= 0} variant="left" />
      )}
      <div
        {...handlers}
        className={clsx(
          'h-full w-full rounded-sm overflow-hidden col-start-2 grid grid-cols-1 grid-rows-1 place-items-center',
          containerAspect,
        )}
      >
        {slides.map((group, i) => (
          <div
            key={i}
            className={clsx(
              'row-start-1 col-start-1 h-full w-full px-4 text-center motion-safe:transition-transform motion-safe:duration-500',
              i > index && 'translate-x-full',
              i < index && '-translate-x-full',
            )}
          >
            <SlideGroup group={group} isActive={i === index} />
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
