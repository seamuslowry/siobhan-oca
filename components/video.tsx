'use client';

import {
  useEffect,
  useRef,
  useState,
  type DetailedHTMLProps,
  type VideoHTMLAttributes,
} from 'react';
import clsx from 'clsx';

export default function Video(
  props: DetailedHTMLProps<
    VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  >,
) {
  const [loaded, setLoaded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { className, ...rest } = props;

  // track hydration because events won't fire properly with SSR on refresh
  useEffect(() => {
    setHydrated(true);
  }, []);

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
