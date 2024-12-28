import Image from 'next/image';
import heroImage from '@/assets/home/hero.png';

export default function Home() {
  return (
    <div>
      <div className="relative">
        <Image
          src={heroImage}
          alt="Hero image description"
          className="absolute h-[80vh] object-cover"
          placeholder="blur"
          unoptimized
        />
        <div className="bg-sky-700/30 absolute ml-[10%] h-[80vh] w-[30vw]" />
      </div>
    </div>
  );
}
