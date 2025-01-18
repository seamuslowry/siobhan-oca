import { z } from 'zod';
import {
  richConfigurationSchema as textSchema,
  TextContent,
} from '@/components/text-content';
import MediaContent, {
  schema as mediaSchema,
} from '@/components/media-content';

export const schema = z.discriminatedUnion('type', [
  textSchema,
  ...mediaSchema.options,
]);

export type AnyContent = z.infer<typeof schema>;

export function AnyContent({ value }: { value: AnyContent }) {
  if (value.type === 'text') {
    return <TextContent value={value} />;
  } else {
    return <MediaContent value={value} />;
  }
}
