'use client';

import { format } from 'date-fns/format';
import { isPast } from 'date-fns/isPast';

export function MemberEndDate({ date }: { date?: Date }) {
  return date && isPast(date) ? format(date, 'MMM yyyy') : 'Current';
}
