import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import { TeamMemberLink } from '@/components/team-member-link';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('team');
}

export default async function Team() {
  const members = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        <h2 className="text-5xl">Team Page</h2>
        {members.map(member => (
          <TeamMemberLink
            key={member.slug}
            slug={member.slug}
            name={member.name}
          />
        ))}
      </div>
    </main>
  );
}
