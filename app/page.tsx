import Image from 'next/image';
import heroImage from '@/assets/home/hero.png';
import bannerImage from '@/assets/home/banner.png';

export default function Home() {
  return (
    <div>
      <div className="sm:relative">
        <Image
          src={heroImage}
          alt="Hero image description"
          className="h-[80vh] object-cover hidden sm:absolute sm:block"
          placeholder="blur"
          unoptimized
        />
        <div className="bg-sky-700/30 grid grid-rows-[1fr_min-content] gap-3 py-8 px-4 h-[80vh] mx-auto w-10/12 sm:animate-slideInFromLeft sm:absolute sm:ml-[10%] sm:w-[30vw] sm:min-w-80">
          <Image
            src={bannerImage}
            alt="Banner image description"
            placeholder="blur"
            className="object-contain h-full"
            unoptimized
          />
          <p className="text-center text-xl">
            Email:{' '}
            <a href="mailto:skr23@duke.edu" className="underline">
              skr23@duke.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
