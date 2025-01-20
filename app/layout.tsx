import type { Metadata } from 'next';
import './globals.css';
import { geistSans } from '@/utils/fonts';
import { retrieveMetadata } from '@/utils/metadata';
import { Navbar } from '@/app/navbar';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('home');
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} antialiased [&:has(dialog[open])]:overflow-hidden`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
