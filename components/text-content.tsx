import clsx from 'clsx';
import { z } from 'zod';

const richConfigurationSchema = z.object({
  text: z.string(),
  bold: z.coerce.boolean().default(false),
  italic: z.coerce.boolean().default(false),
  underline: z.coerce.boolean().default(false),
  align: z.enum(['left', 'right', 'center']).default('left'),
  whitespace: z.enum(['normal', 'pre-wrap']).default('normal'),
  tag: z.enum(['p', 'h1', 'h2', 'h3', 'span']).default('p'),
  size: z
    .enum(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'])
    .default('base'),
});

export const schema = z.union([z.string(), richConfigurationSchema]);

type RichConfiguration = z.infer<typeof richConfigurationSchema>;
export type TextContent = z.infer<typeof schema>;
export type DesiredTextContent = Partial<Omit<RichConfiguration, 'text'>>;

export function TextContent({
  className,
  value,
  desired = {},
}: {
  className?: string;
  value: TextContent;
  desired?: DesiredTextContent;
}) {
  const standardizedValue = typeof value === 'string' ? { text: value } : value;
  const {
    text,
    italic,
    bold,
    underline,
    align,
    whitespace,
    tag: Tag,
    size,
  } = richConfigurationSchema.parse({
    ...desired,
    ...standardizedValue,
  });

  return (
    <Tag
      className={clsx(
        className,
        italic && 'italic',
        bold && 'font-bold',
        underline && 'underline',
        align === 'left' && 'text-left',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        whitespace === 'normal' && 'whitespace-normal',
        whitespace === 'pre-wrap' && 'whitespace-pre-wrap',
        size === 'xs' && 'text-xs',
        size === 'sm' && 'text-sm',
        size === 'base' && 'text-base',
        size === 'lg' && 'text-lg',
        size === 'xl' && 'text-xl',
        size === '2xl' && 'text-2xl',
        size === '3xl' && 'text-3xl',
        size === '4xl' && 'text-4xl',
        size === '5xl' && 'text-5xl',
        size === '6xl' && 'text-6xl',
      )}
    >
      {text}
    </Tag>
  );
}
