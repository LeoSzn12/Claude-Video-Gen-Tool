import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppNav from '../components/layout/AppNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trailer DNA',
  description: 'AI-powered trailer generation studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppNav />
        <main className="min-h-screen bg-slate-950 text-slate-100">
          {children}
        </main>
      </body>
    </html>
  );
}
