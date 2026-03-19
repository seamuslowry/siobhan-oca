import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import mapValues from 'lodash.mapvalues';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';
import { Fragment } from 'react';
import Divider from '@/components/divider';
import TeamMemberGroup from './team-member-group';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('team');
}

export default async function Team() {
  const { groups, members } = await retrieveData();

  const grouped = mapValues(groupBy(members, 'group'), l =>
    sortBy(l, ['name', 'end']),
  );

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {groups.map(({ id, display }, index) => (
          <Fragment key={id}>
            <TeamMemberGroup id={id} text={display} members={grouped[id]} />
            {index < groups.length - 1 && <Divider />}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
