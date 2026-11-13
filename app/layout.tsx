import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PatternProof Cloud | Week 3 Prototype',
  description: 'Limited structured crochet pattern consistency checker.'
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
