import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import Link from 'next/link';
import { TextContent } from '@/components/text-content';

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
          <Link key={member.slug} href={`team/${member.slug}`}>
            <TextContent value={member.name} desired={{ underline: true }} />
          </Link>
        ))}
      </div>
    </main>
  );
}
