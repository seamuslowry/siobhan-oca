import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import TeamMember from './team-member';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('team');
}

export default async function Team() {
  const members = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 grid grid-cols-2 gap-8">
        {members.map(member => (
          <TeamMember key={member.slug} member={member} />
        ))}
      </div>
    </main>
  );
}
