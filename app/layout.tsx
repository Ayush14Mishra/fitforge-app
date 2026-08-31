import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: 'FitForge 2.0 — Built around you',
  description: 'Personalised home and gym training with saved progress, weekly check-ins, and direct premium coaching.',
  openGraph: {
    title: 'FitForge 2.0 — Built around you',
    description: 'Personalised training, persistent progress, and direct premium coaching.',
    images: [{ url: '/og-v2.png', width: 1536, height: 1024, alt: 'FitForge 2.0 — Built around you.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitForge 2.0 — Built around you',
    description: 'Personalised training, persistent progress, and direct premium coaching.',
    images: ['/og-v2.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
