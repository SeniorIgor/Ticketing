'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

type Notification = {
  id: number;
  message: string;
  variant?: 'danger' | 'success' | 'info';
};

type NotificationContextValue = {
  notify: (message: string, variant?: Notification['variant']) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function notify(message: string, variant: Notification['variant'] = 'danger') {
    setNotifications((prev) => [...prev, { id: Date.now(), message, variant }]);

    // auto-remove after 4s
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 4000);
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
        {notifications.map((n) => (
          <div key={n.id} className={`alert alert-${n.variant} mb-2`}>
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotify must be used inside NotificationProvider');
  }
  return ctx.notify;
}
