import type { ReactNode } from 'react';

import Header from '@/components/Header/Header';
import { NotificationProvider } from '@/components/NotificationContext/NotificationContext';

import { rootMetadata, rootViewport } from './metadata';

import './global.css';

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <NotificationProvider>
          <Header />
          <main className="flex-grow-1 d-flex">{children}</main>
        </NotificationProvider>
      </body>
    </html>
  );
}
