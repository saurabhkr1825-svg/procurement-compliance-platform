import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ProcureAI - Bid Compliance Platform',
  description: 'AI Procurement Bid Compliance Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
