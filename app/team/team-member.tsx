import { type TeamMember as TeamMemberType } from '@/utils/team';
import { Duration } from '@/components/duration';
import { TextContent } from '@/components/text-content';
import { ExternalLink } from '@/components/external-link';
import { format } from 'date-fns';

export default async function TeamMember({
  member,
}: {
  member: TeamMemberType;
}) {
  return (
    <div className="bg-white dark:bg-graphite px-8 pb-8 pt-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
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
        <p className="text-md font-bold">
          {format(member.start, 'MMM yyyy')} -{' '}
          {member.end ? format(member.end, 'MMM yyyy') : 'Current'} /{' '}
          <Duration earlierDate={member.start} laterDate={member.end} />
        </p>
      </div>
      {member.current && <p>{member.current}</p>}
    </div>
  );
}
