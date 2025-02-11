'use client';

import { Duration } from '@/components/duration';
import { format, isPast, min } from 'date-fns';

export default function TeamMemberTenure({
  start,
  end,
}: {
  end?: Date;
  start: Date;
}) {
  const now = new Date();
  const nonFutureEnd = min([end, now].filter(d => !!d));

  return (
    <p className="text-md font-bold">
      {format(start, 'MMM yyyy')} -{' '}
      {end && isPast(end) ? format(end, 'MMM yyyy') : 'Current'} /{' '}
      <Duration earlierDate={start} laterDate={nonFutureEnd} />
    </p>
  );
}
