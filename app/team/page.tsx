import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import TeamMember from './team-member';
import partition from 'lodash.partition';
import { Fragment } from 'react';
import Divider from '@/components/divider';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('team');
}

export default async function Team() {
  const members = await retrieveData();

  const [former, current] = partition(members, 'end');

  return (
    <main>
      <div className="mx-[8%] my-10 grid grid-cols-1 gap-4">
        {current.map((member, i) => (
          <Fragment key={member.slug}>
            <TeamMember member={member} />
            {i < current.length - 1 && <Divider />}
          </Fragment>
        ))}
        {current.length > 0 && <Divider />}
        {former.map((member, i) => (
          <Fragment key={member.slug}>
            <TeamMember member={member} />
            {i < current.length - 1 && <Divider />}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
