import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ParticleBackgroundWrapper from '@/components/ParticleBackgorund/ParticleBackgorundWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Three.js Next.js App',
  description: '3D visualization with Three.js and Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ParticleBackgroundWrapper />
        <div className='relative'>{children}</div>
      </body>
    </html>
  );
}
