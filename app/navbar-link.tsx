import ButtonLink from '@/components/button-link';
import { Route } from '@/utils/routes';

export async function NavbarLink({ route }: { route: Route }) {
  return 'href' in route ? (
    <ButtonLink href={route.href}>{route.text}</ButtonLink>
  ) : (
    <div className="grid grid-rows-[min-content_auto] justify-items-center gap-y-1">
      <p className={`row-start-1 col-span-${route.routes.length} text-sm`}>
        {route.text}
      </p>
      {route.routes.map(innerRoute => (
        <span key={innerRoute.text} className="row-start-2">
          <NavbarLink route={innerRoute} />
        </span>
      ))}
    </div>
  );
}
