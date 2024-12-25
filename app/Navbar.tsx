import ButtonLink from '@/components/ButtonLink';
import { MobileNavbarLinks } from './MobileNavbarLinks';

export function Navbar() {
  return (
    <nav className="bg-sky-700">
      <div className="container mx-auto flex items-center justify-between p-2">
        <div className="flex text-lg font-bold rounded">
          <ButtonLink href="/">Siobhan Oca</ButtonLink>
        </div>
        <div id="desktop-nav-links" className="hidden md:flex space-x-3">
          <ButtonLink href="/">Research</ButtonLink>
          <ButtonLink href="/">Teaching</ButtonLink>
          <ButtonLink href="/">News</ButtonLink>
          <ButtonLink href="/">Who</ButtonLink>
        </div>
        <div id="mobile-nav-links" className="md:hidden">
          <MobileNavbarLinks />
        </div>
      </div>
    </nav>
  );
}
