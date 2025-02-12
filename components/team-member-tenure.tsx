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
  const [endDate, setEndDate] = useState<Date | undefined>(end);
  useEffect(() => {
    const now = new Date();
    setNonFutureEnd(min([end, now].filter(d => !!d)));
  }, [end]);

  useEffect(() => {
    setEndDate(end && isPast(end) ? end : undefined);
  }, [end]);

  return (
    <p className="text-md font-bold">
      {format(start, 'MMM yyyy')} -{' '}
      {endDate ? format(endDate, 'MMM yyyy') : 'Current'} /{' '}
      <Duration earlierDate={start} laterDate={nonFutureEnd} />
    </p>
  );
}
