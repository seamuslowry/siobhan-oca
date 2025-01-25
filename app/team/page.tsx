import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import { TeamMemberLink } from '@/components/team-member-link';
import { formatDistanceStrict } from 'date-fns';

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
          <div key={member.slug}>
            <TeamMemberLink slug={member.slug} name={member.name} />
            <p>Start Date: {member.start.toDateString()}</p>
            <p>End Date: {member.end?.toDateString()}</p>
            <p>
              {/* TODO: this should be client. so it's actually calculated dynamically */}
              Time:{' '}
              {formatDistanceStrict(member.end ?? new Date(), member.start)}
            </p>
            <p>Current: {member.current}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
