import { type TeamMember as TeamMemberType } from '@/utils/team';
import TeamMember from './team-member';
import Accordion from '@/components/accordion';
import {
  TextContent,
  type TextContent as TextContentType,
} from '@/components/text-content';

export default async function TeamMemberGroup({
  id,
  text,
  members,
}: {
  id: string;
  text: TextContentType;
  members: TeamMemberType[];
}) {
  return (
    <section id={id}>
      <Accordion
        summary={
          <TextContent value={text} desired={{ size: '5xl', tag: 'h2' }} />
        }
      >
        <div className="ml-2 md:mx-8 my-4 md:my-6 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-10 lg:gap-x-20">
          {members.map(member => (
            <TeamMember member={member} key={member.slug} />
          ))}
        </div>
      </Accordion>
    </section>
  );
}
