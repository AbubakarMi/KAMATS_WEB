import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { MSWProvider } from '@/components/providers/MSWProvider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KAMATS — Kano Alum Management & Transparency System',
  description: 'Enterprise inventory management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning>
        <MSWProvider>
          <StoreProvider>
            {children}
            <Toaster richColors position="top-right" />
          </StoreProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
