'use client';

import { useRouter } from 'next/navigation';

import clsx from 'clsx';

import { useNotify } from '@/components/NotificationContext/NotificationContext';
import { signoutUser } from '@/services/auth';
import { logout, useAppDispatch } from '@/store';

export type SignOutButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export function SignOutButton({ className, ...props }: SignOutButtonProps) {
  const notify = useNotify();
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signoutUser();
      dispatch(logout());

      router.replace('/');
      router.refresh();
    } catch {
      notify('Failed to sign out. Please try again.', 'danger');
    }
  }

  return (
    <button
      type="button"
      className={clsx('btn btn-outline-danger', className)}
      onClick={handleSignOut}
      aria-label="Sign out of your account"
      {...props}
    >
      Sign out
    </button>
  );
}
