export type Route = {
  text: string;
  href: string;
};

const ROUTES: Route[] = [
  { text: 'Teaching', href: '/courses' },
  { text: 'Oca Lab', href: '/research' },
  // { text: 'News', href: '/' },
  { text: 'Team', href: '/team' },
];

export async function retrieveRoutes() {
  return ROUTES;
}
