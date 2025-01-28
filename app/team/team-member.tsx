import { type TeamMember as TeamMemberType } from '@/utils/team';
import { Duration } from '@/components/duration';
import { TextContent } from '@/components/text-content';
import { ExternalLink } from '@/components/external-link';

export default async function TeamMember({
  member,
}: {
  member: TeamMemberType;
}) {
  return (
    <div className="bg-white px-8 pb-8 pt-4 rounded-lg">
      {member.link ? (
        <ExternalLink href={member.link} className="text-3xl">
          <TextContent
            value={member.name}
            desired={{ size: '3xl', underline: true }}
          />
        </ExternalLink>
      ) : (
        <TextContent value={member.name} desired={{ size: '3xl' }} />
      )}
      <p className="pt-3">Start Date: {member.start.toDateString()}</p>
      <p>End Date: {member.end?.toDateString()}</p>
      <p>
        Time: <Duration earlierDate={member.start} laterDate={member.end} />
      </p>
      <p>Current: {member.current}</p>
    </div>
  );
}
