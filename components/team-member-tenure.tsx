'use client';

import { Duration } from '@/components/duration';
import { format, isPast, min } from 'date-fns';
import { useMemo } from 'react';

export default function TeamMemberTenure({
  start,
  end,
}: {
  end?: Date;
  start: Date;
}) {
  const nonFutureEnd = useMemo(() => {
    const now = new Date();
    return min([end, now].filter(d => !!d));
  }, [end]);

  return (
    <p className="text-md font-bold">
      {format(start, 'MMM yyyy')} -{' '}
      {end && isPast(end) ? format(end, 'MMM yyyy') : 'Current'} /{' '}
      <Duration earlierDate={start} laterDate={nonFutureEnd} />
    </p>
  );
}
