import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yeshua Cleaning - Professional Cleaning Services',
  description: 'Book professional cleaning services online. Instant pricing, secure payment, and trusted cleaners for your home or office.',
  keywords: 'cleaning service, house cleaning, professional cleaners, booking, online payment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
