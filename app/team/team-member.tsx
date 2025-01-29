import { type TeamMember as TeamMemberType } from '@/utils/team';
import { Duration } from '@/components/duration';
import { TextContent } from '@/components/text-content';
import { ExternalLink } from '@/components/external-link';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function TeamMember({
  member,
}: {
  member: TeamMemberType;
}) {
  const coursework = await member.getCoursework();

  return (
    <div className="bg-white dark:bg-graphite px-8 pb-8 pt-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        {member.link ? (
          <ExternalLink href={member.link} className="text-4xl">
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
      {member.summary && <p className="my-3">{member.summary}</p>}
      <div className="ml-4">
        {coursework.map(c => (
          <div key={c.id} className="my-3">
            <TextContent
              value={c.name}
              desired={{ size: '2xl', italic: true }}
            />
            <ul>
              {c.projects.map(p => (
                <li key={p.id} className="pl-4 my-1">
                  <Link href={`/courses#${p.id}`}>
                    <TextContent value={p.name} desired={{ underline: true }} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
