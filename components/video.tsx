'use client';

import {
  useEffect,
  useRef,
  useState,
  type DetailedHTMLProps,
  type VideoHTMLAttributes,
} from 'react';
import 'clsx';
import clsx from 'clsx';

export default function Video(
  props: DetailedHTMLProps<
    VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  >,
) {
  const [loaded, setLoaded] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { className, ...rest } = props;

  useEffect(() => {
    setLoaded((videoRef.current?.readyState ?? 0) >= 1);
  }, [videoRef.current?.readyState]);

  useEffect(() => {
    const timeout = setTimeout(() => setWaiting(false), 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="grid grid-rows-1 grid-cols-1">
      {!waiting && !loaded && (
        <div className="aspect-video rounded-lg w-full animate-pulse bg-graphite/30 row-start-1 col-start-1" />
      )}
      <video
        {...rest}
        ref={videoRef}
        className={clsx(
          className,
          !loaded && 'opacity-0',
          'row-start-1 col-start-1',
        )}
      />
    </div>
  );
}
