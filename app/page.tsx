import Image from 'next/image';
import heroImage from '@/assets/home/abstracthero.png';
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
      <div className="relative grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[8%_auto_1fr] w-full overflow-hidden sm:h-[72vh]">
        <Image
          src={heroImage}
          alt={heroDescription}
          fill
          sizes="100vw"
          className="object-cover object-left hidden row-start-1 col-start-1 col-span-3 sm:block"
          placeholder="blur"
          unoptimized
        />
        <div className="bg-limestone/80 backdrop-blur-sm border overflow-auto border-white/35 rounded-none sm:rounded-2xl sm:shadow-xl text-duke-dark row-start-1 col-start-2 z-10 h-full sm:h-auto grid content-start auto-rows-min gap-2 py-6 px-5 mx-auto w-10/12 motion-safe:sm:animate-slide-in-from-left sm:mt-6 sm:mb-6 sm:w-[24vw] sm:min-w-[400px] sm:mx-0 sm:-translate-x-10">
          <div className="flex flex-col items-center">
            <Image
              src={bannerImage}
              alt={bannerDescription}
              placeholder="blur"
              className="object-cover w-[42%] aspect-square rounded-full ring-2 ring-white/70 shadow-sm"
              unoptimized
            />
            <TextContent
              className="pt-2 text-center font-semibold tracking-tight"
              desired={{ size: 'xl' }}
              value={title}
            />
            <a href={`mailto:${email}`} className="underline text-sm pt-0.5">
              {email}
            </a>
          </div>
          <div className="border-t border-duke-dark/20 pt-3 grid gap-1.5">
            {bannerContent
              .filter(p => p !== title)
              .map((p, index) => (
                <TextContent
                  key={index}
                  className="m-0 text-base leading-tight text-left"
                  value={p}
                />
              ))}
          </div>
        </div>
      </div>
      <section className="mx-[10%] mt-0 mb-6">
        {summary.map((s, i) => (
          <TextContent key={i} value={s} className="m-0 py-1" />
        ))}
      </section>
    </main>
  );
}
