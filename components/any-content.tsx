import { z } from 'zod';
import { schema as textSchema, TextContent } from '@/components/text-content';
import MediaContent, {
  schema as mediaSchema,
} from '@/components/media-content';

export const schema = z.union([textSchema, mediaSchema]);

export type AnyContent = z.infer<typeof schema>;

export function AnyContent({ value }: { value: AnyContent }) {
  if (typeof value === 'string' || !('type' in value)) {
    return <TextContent value={value} />;
  } else {
    return <MediaContent value={value} />;
  }
}
