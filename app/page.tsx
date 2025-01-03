import Image from 'next/image';
import heroImage from '@/assets/home/hero.png';
import bannerImage from '@/assets/home/banner.png';
import { readFile } from 'fs/promises';
import json5 from 'json5';

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
  } = json5.parse<ContentConfiguration>(
    await readFile(`./public/home/content.json5`, 'utf-8'),
  );

  return (
    <div>
      <div className="grid grid-cols-[auto_auto_auto] sm:grid-cols-[10%_auto_auto] min-h-fit h-[80vh] max-h-[56rem] w-full">
        <Image
          src={heroImage}
          alt={heroDescription}
          className="object-cover hidden h-full w-full row-start-1 col-start-1 col-span-3 sm:block"
          placeholder="blur"
          unoptimized
        />
        <div className="bg-sky-700/30 row-start-1 col-start-2 h-full grid grid-rows-[auto_auto_auto] gap-3 py-8 px-4 mx-auto w-10/12 sm:animate-slideInFromLeft sm:w-[20vw] sm:min-w-80">
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
    </div>
  );
}
