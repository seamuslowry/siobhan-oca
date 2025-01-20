import type { Metadata } from 'next';
import { retrieveTeamMemberMetadata } from '@/utils/metadata';
import {
  retrieveData,
  type TeamPageData,
  type TeamMember,
  retrieveTeamMemberData,
} from '@/utils/team';
import { TextContent } from '@/components/text-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<TeamMember>;
}): Promise<Metadata> {
  return retrieveTeamMemberMetadata((await params).slug);
}

export async function generateStaticParams(): Promise<TeamPageData> {
  return retrieveData();
}

export default async function TeamMember({
  params,
}: {
  params: Promise<TeamMember>;
}) {
  const member = await retrieveTeamMemberData((await params).slug);

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        <p>{member.slug}</p>
        <TextContent value={member.name} />
      </div>
    </main>
  );
}
