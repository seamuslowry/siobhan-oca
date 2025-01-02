import Image from 'next/image';
import heroImage from '@/assets/home/hero.png';
import bannerImage from '@/assets/home/banner.png';

export default function Home() {
  return (
    <div>
      <div className="grid grid-cols-[auto_auto_auto] sm:grid-cols-[10%_auto_auto] min-h-fit h-[80vh] max-h-[56rem]">
        <Image
          src={heroImage}
          alt="Hero image description"
          className="object-cover hidden h-full row-start-1 col-start-1 col-span-3 sm:block"
          placeholder="blur"
          unoptimized
        />
        <div className="bg-sky-700/30 row-start-1 col-start-2 h-full grid grid-rows-[auto_auto_auto] gap-3 py-8 px-4 mx-auto w-10/12 sm:animate-slideInFromLeft sm:w-[20vw] sm:min-w-80">
          <div className="flex flex-col items-center">
            <Image
              src={bannerImage}
              alt="Banner image description"
              placeholder="blur"
              className="object-cover w-[80%] aspect-square rounded-full"
              unoptimized
            />
            <p className="text-3xl pt-3">Siobhan Oca, PhD</p>
            <a href="mailto:skr23@duke.edu" className="underline text-xl pt-3">
              skr23@duke.edu
            </a>
          </div>
          <p className="text-xl text-center">
            Assistant Professor of Mechanical Engineering and Materials Science
            at Duke University
          </p>
          <p className="text-xl text-center">
            Assistant Director of Masters in Robotics at Duke University
          </p>
        </div>
      </div>
    </div>
  );
}
