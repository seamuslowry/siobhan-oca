import Image from 'next/image';
import heroImage from '@/assets/home/hero.png';
import bannerImage from '@/assets/home/banner.png';
import { readFile } from 'fs/promises';
import { parse } from 'yaml';

interface ContentConfiguration {
  hero?: {
    alt?: string;
  };
  banner: {
    alt?: string;
    title?: string;
    email?: string;
    content?: string[];
  };
}

export default async function Home() {
  const {
    hero: { alt: heroDescription = '' } = {},
    banner: {
      alt: bannerDescription = '',
      title = '',
      email = '',
      content: bannerContent = [],
    } = {},
  }: ContentConfiguration = parse(
    await readFile(`./public/home/content.yaml`, 'utf-8'),
  );

  return (
    <main>
      <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[10%_auto_1fr] min-h-fit h-[80vh] max-h-[56rem] w-full">
        <Image
          src={heroImage}
          alt={heroDescription}
          className="object-cover hidden h-full w-full row-start-1 col-start-1 col-span-3 sm:block"
          placeholder="blur"
          unoptimized
        />
        {/* cast iron was good */}
        <div className="bg-limestone/80 text-duke-light dark:text-duke-dark row-start-1 col-start-2 h-full grid gap-3 py-8 px-4 mx-auto w-10/12 sm:animate-slideInFromLeft sm:w-[20vw] sm:min-w-80">
          <div className="flex flex-col items-center">
            <Image
              src={bannerImage}
              alt={bannerDescription}
              placeholder="blur"
              className="object-cover w-[80%] aspect-square rounded-full"
              unoptimized
            />
            <p className="text-3xl pt-3">{title}</p>
            <a href={`mailto:${email}`} className="underline text-xl pt-3">
              {email}
            </a>
          </div>
          {bannerContent.map((p, index) => (
            <p key={index} className="text-xl text-center">
              {p}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}
