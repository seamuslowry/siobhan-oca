import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/team';
import TeamMember from './team-member';
import mapValues from 'lodash.mapvalues';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';
import Accordion from '@/components/accordion';
import { TextContent } from '@/components/text-content';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('team');
}

export default async function Team() {
  const pageData = await retrieveData();

  const grouped = mapValues(groupBy(pageData.members, 'group'), l =>
    sortBy(l, ['name', 'end']),
  );

  return (
    <main>
      {Object.entries(grouped).map(([group, members]) => (
        <section key={group} className="mx-[8%] my-10 ">
          <Accordion
            summary={
              <TextContent value={group} desired={{ size: '5xl', tag: 'h2' }} />
            }
          >
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-10 lg:gap-x-20">
              {members.map(member => (
                <TeamMember member={member} key={member.slug} />
              ))}
            </div>
          </Accordion>
        </section>
      ))}
      {/* <div className="mx-[8%] my-10 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-10 lg:gap-x-20">
        {current.map(member => (
          <TeamMember member={member} key={member.slug} />
        ))}
        {former
          .toSorted((a, b) => (b.end?.getTime() ?? 0) - (a.end?.getTime() ?? 0))
          .map(member => (
            <TeamMember member={member} key={member.slug} />
          ))}
      </div> */}
    </main>
  );
}
