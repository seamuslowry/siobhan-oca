'use client';

import { Duration } from '@/components/duration';
import { format, isPast, min } from 'date-fns';
import { useEffect, useState } from 'react';

export default function TeamMemberTenure({
  start,
  end,
}: {
  end?: Date;
  start: Date;
}) {
  const [nonFutureEnd, setNonFutureEnd] = useState<Date | undefined>(end);
  useEffect(() => {
    const now = new Date();
    setNonFutureEnd(min([end, now].filter(d => !!d)));
  }, [end]);

  return (
    <p className="text-md font-bold">
      {format(start, 'MMM yyyy')} -{' '}
      {end && isPast(end) ? format(end, 'MMM yyyy') : 'Current'} /{' '}
      <Duration earlierDate={start} laterDate={nonFutureEnd} />
    </p>
  );
}
