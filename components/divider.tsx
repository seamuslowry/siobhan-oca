import clsx from 'clsx';

export default function Divider({
  vertical,
  className,
}: {
  vertical?: boolean;
  className?: string;
}) {
  return vertical ? (
    <div
      className={clsx(
        'h-full w-px bg-graphite dark:bg-whisper-gray',
        className,
      )}
    />
  ) : (
    <hr
      className={clsx(
        'my-4 border-graphite dark:border-whisper-gray',
        className,
      )}
    />
  );
}
