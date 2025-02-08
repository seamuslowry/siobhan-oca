import ButtonLink from '@/components/button-link';
import { MobileNavbarLinks } from '@/app/mobile-navbar';
import { retrieveRoutes } from '@/utils/routes';
import { NavbarLink } from './navbar-link';

export async function Navbar() {
  const routes = await retrieveRoutes();

  return (
    <nav className="bg-duke-dark text-white text-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-2">
        <div className="flex text-2xl font-bold rounded-sm">
          <ButtonLink href="/">Siobhan Oca</ButtonLink>
        </div>
        <div
          id="desktop-nav-links"
          className="hidden md:flex items-center space-x-3"
        >
          {routes.map(r => (
            <NavbarLink key={r.text} route={r} />
          ))}
        </div>
        <div id="mobile-nav-links" className="flex md:hidden">
          <MobileNavbarLinks routes={routes} />
        </div>
      </div>
    </nav>
  );
}
