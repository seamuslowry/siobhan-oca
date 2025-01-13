import ButtonLink from '@/components/button-link';
import { MobileNavbarLinks } from './mobile-navbar';
import { retrieveRoutes } from '@/utils/routes';

export async function Navbar() {
  const routes = await retrieveRoutes();

  return (
    <nav className="bg-duke-dark text-white text-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-2">
        <div className="flex text-2xl font-bold rounded">
          <ButtonLink href="/">Siobhan Oca</ButtonLink>
        </div>
        <div id="desktop-nav-links" className="hidden md:flex space-x-3">
          {routes.map(({ text, href }) => (
            <ButtonLink key={text} href={href}>
              {text}
            </ButtonLink>
          ))}
        </div>
        <div id="mobile-nav-links" className="flex md:hidden">
          <MobileNavbarLinks routes={routes} />
        </div>
      </div>
    </nav>
  );
}
