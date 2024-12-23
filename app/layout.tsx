import type { Metadata } from 'next';
import './globals.css';
import { parse } from 'csv-parse';
import { geistMono, geistSans } from './fonts';
import { readFile } from 'fs/promises';

export async function generateMetadata(): Promise<Metadata> {
  const csv = await readFile('./public/metadata/default.csv', 'utf8');

  const metadata = await parse(csv, {
    columns: true,
    skip_empty_lines: true,
    // TODO: something other than toArray?
  }).toArray();

  return {
    title: metadata[0].title,
    description: metadata[0].description,
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
