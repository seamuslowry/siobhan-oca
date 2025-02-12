'use client';

import { Duration } from '@/components/duration';
import { format, isPast, min } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useEffect, useState } from 'react';

export default function TeamMemberTenure({
  start,
  end,
}: {
  end?: Date;
  start: Date;
}) {
  const [{ endDate, nonFutureEnd }, setClientState] = useState<{
    nonFutureEnd?: Date;
    endDate?: Date;
  }>({});

  useEffect(() => {
    const now = new Date();
    const endDate = end && isPast(end) ? end : undefined;
    const nonFutureEnd = min([end, now].filter(d => !!d));
    setClientState({ endDate, nonFutureEnd });
  }, [end]);

  if (!nonFutureEnd) {
    return (
      <p className="text-md font-bold">
        {format(start, 'MMM yyyy', { locale: enUS })} -
      </p>
    );
  }

  return (
    <p className="text-md font-bold">
      {format(start, 'MMM yyyy', { locale: enUS })} -{' '}
      {endDate ? format(endDate, 'MMM yyyy', { locale: enUS }) : 'Current'} /{' '}
      <Duration earlierDate={start} laterDate={nonFutureEnd} />
    </p>
  );
}
