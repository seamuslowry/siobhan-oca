import ButtonLink from '@/components/button-link';
import { Route } from '@/utils/routes';

export async function NavbarLink({
  route,
  className,
}: {
  route: Route;
  className?: string;
}) {
  return 'href' in route ? (
    <ButtonLink href={route.href} className={className}>
      {route.text}
    </ButtonLink>
  ) : (
    <fieldset className="flex border border-whisper-gray px-1 pb-1 rounded-sm">
      <legend className="text-base px-1">{route.text}</legend>
      {route.routes.map(innerRoute => (
        <NavbarLink
          key={innerRoute.text}
          route={innerRoute}
          className="p-1! mx-1"
        />
      ))}
    </fieldset>
  );
}
