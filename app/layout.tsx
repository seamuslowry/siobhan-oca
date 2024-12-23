import type { Metadata } from 'next';
import './globals.css';
import { geistMono, geistSans } from '../utils/fonts';
import { retrieveMetadata } from '@/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  console.log(await retrieveMetadata('default'));

  return retrieveMetadata('default');
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
