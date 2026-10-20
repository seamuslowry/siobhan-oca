type LeafRoute = {
  text: string;
  href: string;
};

type NodeRoute = {
  text: string;
  routes: Route[];
};

export type Route = NodeRoute | LeafRoute;

const ROUTES: Route[] = [
  { text: 'Teaching', href: '/courses' },
  {
    text: 'Oca Lab',
    routes: [
      { text: 'Research', href: '/research' },
      { text: 'Team', href: '/team' },
    ],
  },
  { text: 'Media', href: '/media' },
];

export async function retrieveRoutes() {
  return ROUTES;
}
