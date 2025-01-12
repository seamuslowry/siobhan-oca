import Image from 'next/image';
import heroImage from '@/assets/home/hero.png';
import bannerImage from '@/assets/home/banner.png';
import { TextContent } from '@/components/text-content';
import { retrieveData } from '@/utils/home';

export default async function Home() {
  const {
    hero: { alt: heroDescription },
    banner: { alt: bannerDescription, title, email, content: bannerContent },
    summary,
  } = await retrieveData();

  return (
    <main>
      <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[10%_auto_1fr] w-full">
        <Image
          src={heroImage}
          alt={heroDescription}
          className="object-cover hidden h-full w-full row-start-1 col-start-1 col-span-3 sm:block"
          placeholder="blur"
          unoptimized
        />
        <div className="bg-limestone/80 text-duke-dark row-start-1 col-start-2 h-full grid gap-3 py-8 px-4 mx-auto w-10/12 motion-safe:sm:animate-slideInFromLeft sm:w-[20vw] sm:min-w-80">
          <div className="flex flex-col items-center">
            <Image
              src={bannerImage}
              alt={bannerDescription}
              placeholder="blur"
              className="object-cover w-[80%] aspect-square rounded-full"
              unoptimized
            />
            <TextContent
              className="pt-3"
              desired={{ size: '3xl' }}
              value={title}
            />
            <a href={`mailto:${email}`} className="underline text-xl pt-3">
              {email}
            </a>
          </div>
          {bannerContent.map((p, index) => (
            <TextContent
              key={index}
              className="text-xl text-center"
              value={p}
            />
          ))}
        </div>
      </div>
      <section className="mx-[10%] my-10">
        {summary.map((s, i) => (
          <TextContent key={i} value={s} className="py-1" />
        ))}
      </section>
    </main>
  );
}
