import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks whether a CSS media query matches.
 *
 * The site is statically exported, so the server can't know the viewport.
 * `serverValue` is used for the prerendered HTML and during hydration. React
 * then re-renders with the real value without a hydration mismatch.
 */
export function useMediaQuery(query: string, serverValue: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
