import Image from 'next/image';

export interface Course {
  name?: string;
  image?: string;
}

export async function Course({
  course: { name = '', image: imagePath },
}: {
  course: Course;
}) {
  const image = (await import(`@/assets/courses/${imagePath}`)).default;

  return (
    <div className="grid grid-cols-[3fr_7fr] bg-limestone dark:bg-graphite rounded-lg overflow-hidden m-3 h-96">
      <Image
        src={image}
        alt="test"
        unoptimized
        className="object-cover h-full"
      />
      <div>
        <p>{name}</p>
      </div>
    </div>
  );
}
