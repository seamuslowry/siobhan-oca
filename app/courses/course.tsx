export interface Course {
  name?: string;
}

export function Course({ course: { name = '' } }: { course: Course }) {
  return (
    <div className="grid grid-cols-[3fr_7fr] bg-limestone dark:bg-graphite rounded m-3">
      <div />
      <div>
        <p>{name}</p>
      </div>
    </div>
  );
}
