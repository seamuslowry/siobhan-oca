import type { Metadata } from 'next';
import './globals.css';
import { geistMono, geistSans } from '@/utils/fonts';
import { retrieveMetadata } from '@/utils/metadata';
import { Navbar } from './navbar';

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
        className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} antialiased [&:has(dialog[open])]:overflow-hidden`}
      >
        <script>0</script>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
