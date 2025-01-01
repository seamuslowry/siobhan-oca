import Image from 'next/image';
import heroImage from '@/assets/home/hero.png';

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
        <div className="bg-sky-700/30 h-[80vh] mx-auto w-10/12 sm:absolute sm:ml-[10%] sm:w-[30vw] sm:min-w-80" />
      </div>
    </div>
  );
}
