'use client';

import { format, isPast } from 'date-fns';

export function MemberEndDate({ date }: { date?: Date }) {
  return date && isPast(date) ? format(date, 'MMM yyyy') : 'Current';
}
