import type { Metadata } from 'next';

export const rootMetadata: Metadata = {
  metadataBase: new URL('https://ticketing.dev'),

  title: {
    default: 'Ticketing',
    template: '%s | Ticketing',
  },

  description: 'Ticketing is a modern platform for booking and managing tickets.',

  applicationName: 'Ticketing',

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: 'website',
    siteName: 'Ticketing',
    title: 'Ticketing',
    description: 'Book, manage, and track tickets with ease.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ticketing',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Ticketing',
    description: 'Book, manage, and track tickets with ease.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const rootViewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d6efd',
};
