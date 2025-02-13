'use client';

import { isPast } from 'date-fns';
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';
import { formatDistanceToNowStrict } from 'date-fns/formatDistanceToNowStrict';

export function MemberDuration({ start, end }: { end?: Date; start: Date }) {
  return end && isPast(end)
    ? formatDistanceStrict(end, start)
    : formatDistanceToNowStrict(start);
}
