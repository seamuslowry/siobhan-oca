import type { Metadata } from 'next';
import './globals.css';
import { geistMono, geistSans } from '../utils/fonts';
import { retrieveMetadata } from '@/utils/metadata';
import ButtonLink from '@/components/ButtonLink';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('default');
}

function Navbar() {
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
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
