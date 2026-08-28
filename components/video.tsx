'use client';

import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type DetailedHTMLProps,
  type VideoHTMLAttributes,
} from 'react';
import clsx from 'clsx';

// Provided by ancestors (e.g. Slider) to signal whether the wrapping slide is
// the active one. When this transitions from true to false, the video pauses
// itself so off-screen audio does not bleed across slides. Defaults to true so
// any Video rendered outside such an ancestor behaves exactly as before.
export const IsActiveContext = createContext<boolean>(true);

export default function Video(
  props: DetailedHTMLProps<
    VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  >,
) {
  const [loaded, setLoaded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isActive = use(IsActiveContext);
  const { className, ...rest } = props;

  // track hydration because events won't fire properly with SSR on refresh
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Pause the video when its slide leaves the active position. Without this,
  // a playing video continues to emit audio after the viewer swipes/arrows
  // away (the slider keeps non-active slides in the DOM via CSS transforms).
  useEffect(() => {
    if (!isActive) {
      videoRef.current?.pause();
    }
  }, [isActive]);

  return (
    <div
      className={clsx(
        className,
        !loaded &&
          'rounded-lg w-full animate-pulse bg-limestone/60 dark:bg-graphite/30',
      )}
    >
      {/* don't attempt to render the video until hydration */}
      {hydrated && (
        <video
          {...rest}
          ref={videoRef}
          onLoadedMetadata={() => setLoaded(true)}
          className={clsx('h-full w-full', !loaded && 'opacity-0')}
        />
      )}
    </div>
  );
}
