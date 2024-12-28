import Image from 'next/image';
import heroImage from './hero.png';

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
        <div className="bg-sky-500/50 absolute ml-[10%] h-[80vh] w-[20vw]" />
      </div>
    </div>
  );
}
