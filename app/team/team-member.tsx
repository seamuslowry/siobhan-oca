import { type TeamMember as TeamMemberType } from '@/utils/team';
import { TextContent } from '@/components/text-content';
import { ExternalLink } from '@/components/external-link';
import { MemberDuration } from '@/components/member-duration';
import { MemberEndDate } from '@/components/member-end-date';
import Link from 'next/link';
import { format } from 'date-fns/format';

export default async function TeamMember({
  member,
}: {
  member: TeamMemberType;
}) {
  const coursework = await member.getCoursework();
  const topics = await member.getTopics();

  return (
    <section>
      <div className="grid grid-cols-[auto_1fr] gap-x-6 items-center mb-2">
        <span>
          {member.link ? (
            <ExternalLink href={member.link} className="text-2xl">
              <TextContent
                value={member.name}
                desired={{ size: '2xl', underline: true }}
              />
            </ExternalLink>
          ) : (
            <TextContent value={member.name} desired={{ size: '2xl' }} />
          )}
          <p className="text-md font-medium mt-1">
            {format(member.start, 'MMM yyyy')} -{' '}
            <MemberEndDate date={member.end} /> /{' '}
            <MemberDuration start={member.start} end={member.end} />
          </p>
        </span>
      </div>
      {member.summary && <p className="pl-2 my-3 text-md">{member.summary}</p>}
      <div className="mx-2 flex flex-col gap-4">
        {topics.length > 0 &&
          topics.map(t => (
            <div key={t.id}>
              <Link href={`/research#${t.id}`}>
                <TextContent
                  value={t.name}
                  desired={{ size: 'lg', underline: true }}
                />
              </Link>
              <ul>
                {t.papers.map((p, i) => (
                  <li key={i} className="pl-4 my-1">
                    <TextContent value={p.title} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        {coursework.length > 0 &&
          coursework.map(c => (
            <div key={c.id}>
              <TextContent
                value={c.name}
                desired={{ size: 'lg', italic: true }}
              />
              <ul>
                {c.projects.map(p => (
                  <li key={p.id} className="pl-4 my-1">
                    <Link href={`/courses#${p.id}`}>
                      <TextContent
                        value={p.name}
                        desired={{ underline: true }}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </section>
  );
}
