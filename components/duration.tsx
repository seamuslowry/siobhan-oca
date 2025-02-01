'use client';

import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';
import { formatDistanceToNowStrict } from 'date-fns/formatDistanceToNowStrict';

export function Duration({
  laterDate,
  earlierDate,
}: {
  laterDate?: Date;
  earlierDate: Date;
}) {
  return laterDate
    ? formatDistanceStrict(laterDate, earlierDate)
    : formatDistanceToNowStrict(earlierDate);
}
