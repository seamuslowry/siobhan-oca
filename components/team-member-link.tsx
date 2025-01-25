import { retrieveTeamMemberData } from '@/utils/team';
import Link from 'next/link';
import {
  type DesiredTextContent,
  TextContent,
  type TextContent as TextContentType,
} from './text-content';

export async function TeamMemberLink({
  slug,
  name,
  desired = {},
}: {
  slug?: string;
  name: TextContentType;
  desired?: DesiredTextContent;
}) {
  const retrievedData = await retrieveTeamMemberData(slug ?? '');
  if (retrievedData?.link) {
    return (
      <Link key={slug} href={retrievedData?.link} target="_blank">
        <TextContent value={name} desired={{ underline: true, ...desired }} />
      </Link>
    );
  } else {
    return <TextContent value={name} desired={{ italic: true, ...desired }} />;
  }
}
