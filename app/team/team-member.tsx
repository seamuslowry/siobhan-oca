import { type TeamMember as TeamMemberType } from '@/utils/team';
import { Duration } from '@/components/duration';
import { TextContent } from '@/components/text-content';
import { ExternalLink } from '@/components/external-link';
import { format } from 'date-fns';
import Link from 'next/link';
import { createAvatar } from '@dicebear/core';
import * as thumbs from '@dicebear/thumbs';
import Divider from '@/components/divider';
import Image from 'next/image';

export default async function TeamMember({
  member,
}: {
  member: TeamMemberType;
}) {
  const coursework = await member.getCoursework();
  const topics = await member.getTopics();

  const avatar = createAvatar(thumbs, {
    seed: member.slug,
  });

  const svg = avatar.toDataUri();

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] grid-rows-[auto-auto] gap-x-4 gap-y-0 items-center mb-3">
        <Image
          src={svg}
          alt={member.name}
          className="object-cover min-w-24 h-auto rounded-full row-span-2"
          width={24}
          height={24}
          unoptimized
        />
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
      {member.summary && <p className="mt-5">{member.summary}</p>}
      <div className="m-4 grid grid-cols-[1fr_auto_1fr] gap-8">
        {topics.length > 0 && (
          <div>
            {topics.map(t => (
              <div key={t.id} className="mt-5">
                <Link href={`/research#${t.id}`}>
                  <TextContent
                    value={t.name}
                    desired={{ size: '2xl', underline: true }}
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
          </div>
        )}
        {topics.length > 0 && coursework.length > 0 && <Divider vertical />}
        {coursework.length > 0 && (
          <div>
            {coursework.map(c => (
              <div key={c.id} className="mt-5">
                <TextContent
                  value={c.name}
                  desired={{ size: '2xl', italic: true }}
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
        )}
      </div>
    </div>
  );
}
