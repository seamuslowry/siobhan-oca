import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import TeamMember from './team-member';
import partition from 'lodash.partition';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('team');
}

export default async function Team() {
  const members = await retrieveData();

  const [former, current] = partition(members, 'end');

  return (
    <main>
      <div className="mx-[8%] my-10 grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-8">
        {current.map(member => (
          <TeamMember member={member} key={member.slug} />
        ))}
        {former.map(member => (
          <TeamMember member={member} key={member.slug} />
        ))}
      </div>
    </main>
  );
}
