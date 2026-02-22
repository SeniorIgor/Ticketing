import type { ReactNode } from 'react';

import Header from '@/components/Header/Header';
import { ModalProvider } from '@/components/Modal';
import { NotificationProvider } from '@/components/NotificationContext/NotificationContext';
import { Providers } from '@/components/Providers/Providers';
import { PublicEnvProvider } from '@/context';
import { getHydrationPayload } from '@/store/hydration/getHydrationPayload';
import { requireServerEnv } from '@/utils';

import { rootMetadata, rootViewport } from './metadata';

import './global.css';

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const boot = await getHydrationPayload();
  const stripePublishableKey = requireServerEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');

  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <PublicEnvProvider stripePublishableKey={stripePublishableKey}>
          <Providers preloadedState={boot.data}>
            <ModalProvider>
              <NotificationProvider>
                <Header />
                <main className="flex-grow-1 d-flex">{children}</main>
              </NotificationProvider>
            </ModalProvider>
          </Providers>
        </PublicEnvProvider>
      </body>
    </html>
  );
}
