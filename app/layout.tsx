import type { Metadata } from 'next';
import './globals.css';
import { geistMono, geistSans } from './fonts';
import { readFile } from 'fs/promises';

export async function generateMetadata(): Promise<Metadata> {
  const title = await readFile('./public/metadata/default/title.txt', 'utf8');
  const description = await readFile(
    './public/metadata/default/description.txt',
    'utf8',
  );

  return {
    title,
    description,
  };
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
