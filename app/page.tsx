import Image from 'next/image';
import heroImage from '@/assets/home/hero.png';
import bannerImage from '@/assets/home/banner.png';

export default function Home() {
  return (
    <div>
      <div className="sm:relative max-h-[clamp(fit-content,80vh,56rem)] sm:h-[80vh]">
        <Image
          src={heroImage}
          alt="Hero image description"
          className="object-cover hidden h-full sm:absolute sm:block"
          placeholder="blur"
          unoptimized
        />
        <div className="bg-sky-700/30 h-full grid grid-rows-[auto_auto_auto] items-center justify-evenly gap-3 py-8 px-4 mx-auto w-10/12 sm:animate-slideInFromLeft sm:absolute sm:ml-[10%] sm:w-[20vw] sm:min-w-80">
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
