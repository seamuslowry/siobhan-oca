import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import TeamMember from './team-member';
import partition from 'lodash.partition';
import { TextContent } from '@/components/text-content';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('team');
}

export default async function Team() {
  const members = await retrieveData();

  const [former, current] = partition(members, 'end');

  return (
    <main>
      <div className="mx-[8%] my-10 grid grid-cols-2 gap-8">
        <TextContent
          value="Current Members"
          desired={{ size: '4xl', tag: 'h2' }}
          className="col-span-2"
        />
        {current.map(member => (
          <TeamMember key={member.slug} member={member} />
        ))}
        <TextContent
          value="Former Members"
          desired={{ size: '4xl', tag: 'h2' }}
          className="col-span-2"
        />
        {former.map(member => (
          <TeamMember key={member.slug} member={member} />
        ))}
      </div>
    </main>
  );
}
