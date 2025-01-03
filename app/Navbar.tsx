import ButtonLink from '@/components/ButtonLink';
import { MobileNavbarLinks } from './MobileNavbarLinks';

export function Navbar() {
  return (
    <nav className="bg-duke-light text-white dark:bg-duke-dark sticky top-0">
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
        <div id="mobile-nav-links" className="flex md:hidden">
          <MobileNavbarLinks />
        </div>
      </div>
    </nav>
  );
}
