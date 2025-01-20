import { retrieveTeamMemberData } from '@/utils/team';
import kebabCase from 'lodash.kebabcase';
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
  const evaluatedSlug =
    slug ?? kebabCase(typeof name === 'string' ? name : name.text);
  try {
    const retrievedData = await retrieveTeamMemberData(evaluatedSlug);

    return (
      <Link key={retrievedData.slug} href={`team/${retrievedData.slug}`}>
        <TextContent
          value={retrievedData.name}
          desired={{ underline: true, ...desired }}
        />
      </Link>
    );
  } catch {
    return <TextContent value={name} desired={{ italic: true, ...desired }} />;
  }
}
