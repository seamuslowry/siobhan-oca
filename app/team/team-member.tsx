import { type TeamMember as TeamMemberType } from '@/utils/team';
import { Duration } from '@/components/duration';
import { TextContent } from '@/components/text-content';
import { ExternalLink } from '@/components/external-link';
import { format } from 'date-fns';
import Link from 'next/link';
import { createAvatar } from '@dicebear/core';
import * as thumbs from '@dicebear/thumbs';
import Image from 'next/image';
import startCase from 'lodash.startcase';

async function getImage(slug: string) {
  try {
    // this import won't fail in local dev if the file doesn't exist
    // the import only fails when actually building the project
    return (await import(`@/assets/team/${slug}.png`)).default;
  } catch {
    return createAvatar(thumbs, {
      seed: slug,
    }).toDataUri();
  }
}

export default async function TeamMember({
  member,
}: {
  member: TeamMemberType;
}) {
  const coursework = await member.getCoursework();
  const topics = await member.getTopics();

  const avatarImg = await getImage(member.slug);

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] gap-x-6 items-center mb-8">
        <Image
          src={avatarImg}
          alt={member.name}
          className="object-cover min-w-24 h-auto rounded-full"
          width={24}
          height={24}
          unoptimized
        />
        <span>
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
          <p className="italic">{startCase(member.type)}</p>
        </span>
      </div>
      {member.summary && (
        <p className="my-5 text-lg font-medium">{member.summary}</p>
      )}
      <div className="mx-4 flex flex-col gap-8">
        {topics.length > 0 &&
          topics.map(t => (
            <div key={t.id}>
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
        {coursework.length > 0 &&
          coursework.map(c => (
            <div key={c.id}>
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
    </div>
  );
}
