import Image from 'next/image';

export interface Course {
  name?: string;
  image?: {
    src?: string;
    alt?: string;
  };
}

export async function Course({
  course: { name = '', image: { src = '', alt = '' } = {} },
}: {
  course: Course;
}) {
  const image = (await import(`@/assets/courses/${src}`)).default;

  return (
    <div className="grid grid-cols-[3fr_7fr] bg-limestone dark:bg-graphite rounded-lg overflow-hidden m-3 h-96">
      <Image
        src={image}
        alt={alt}
        className="object-cover h-full"
        unoptimized
      />
      <div>
        <p>{name}</p>
      </div>
    </div>
  );
}
