import ButtonLink from '@/components/button-link';
import { Route } from '@/utils/routes';

export async function NavbarLink({ route }: { route: Route }) {
  return 'href' in route ? (
    <ButtonLink href={route.href}>{route.text}</ButtonLink>
  ) : (
    <div className="flex flex-col justify-items-center gap-y-1">
      <p className="text-sm">
        {route.text}
      </p>
      <div>
        {route.routes.map(innerRoute => (
          <NavbarLink key={innerRoute.text} route={innerRoute} />
        ))}
      </div>
    </div>
  );
}
