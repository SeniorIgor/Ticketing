import type { ReactNode } from 'react';

import Header from '@/components/Header/Header';
import { NotificationProvider } from '@/components/NotificationContext/NotificationContext';
import { Providers } from '@/components/Providers/Providers';
import { getHydrationPayload } from '@/store/hydration/getHydrationPayload';

import { rootMetadata, rootViewport } from './metadata';

import './global.css';

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const boot = await getHydrationPayload();

  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <Providers preloadedState={boot.data}>
          <NotificationProvider>
            <Header />
            <main className="flex-grow-1 d-flex">{children}</main>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
