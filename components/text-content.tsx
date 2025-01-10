import clsx from 'clsx';

interface TextContentConfiguration {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'right' | 'center';
  whitespace?: 'normal' | 'pre-wrap';
  tag?: 'p' | 'h1' | 'h2' | 'h3';
  size?:
    | 'xs'
    | 'sm'
    | 'base'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl';
}

export type TextContent = string | TextContentConfiguration;

export function TextContent({
  className,
  value,
  desired = {},
}: {
  className?: string;
  value: TextContent;
  desired?: Omit<TextContentConfiguration, 'text'>;
}) {
  const standardizedValue = typeof value === 'string' ? { text: value } : value;
  const {
    text,
    italic,
    bold,
    underline,
    align = 'left',
    whitespace = 'normal',
    tag: Tag = 'p',
    size = 'base',
  } = {
    ...desired,
    ...standardizedValue,
  };

  return (
    <Tag
      className={clsx(
        className,
        italic && 'italic',
        bold && 'bold',
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
