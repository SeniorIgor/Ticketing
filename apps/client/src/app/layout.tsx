import type { ReactNode } from 'react';

import Header from '@/components/Header/Header';
import { NotificationProvider } from '@/components/NotificationContext/NotificationContext';
import { isAuthenticated } from '@/utils';

import { rootMetadata, rootViewport } from './metadata';

import './global.css';

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const authenticated = await isAuthenticated();

  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <NotificationProvider>
          <Header isAuthenticated={authenticated} />
          <main className="flex-grow-1 d-flex">{children}</main>
        </NotificationProvider>
      </body>
    </html>
  );
}
