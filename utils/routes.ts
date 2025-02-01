export type Route = {
  text: string;
  href: string;
};

const ROUTES: Route[] = [
  { text: 'The Oca Lab', href: '/research' },
  { text: 'Teaching', href: '/courses' },
  // { text: 'News', href: '/' },
  { text: 'Team', href: '/team' },
];

export async function retrieveRoutes() {
  return ROUTES;
}
