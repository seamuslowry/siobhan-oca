import type { Metadata } from 'next';
import './globals.css';
import { geistMono, geistSans } from '@/utils/fonts';
import { retrieveMetadata } from '@/utils/metadata';
import { Navbar } from './Navbar';

export async function generateMetadata(): Promise<Metadata> {
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
        className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
