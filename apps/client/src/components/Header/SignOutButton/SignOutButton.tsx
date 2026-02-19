'use client';

import { useRouter } from 'next/navigation';

import { useNotify } from '@/components/NotificationContext/NotificationContext';
import { signoutUser } from '@/services';
import { logout, useAppDispatch } from '@/store';

export default function SignOutButton() {
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
      className="btn btn-outline-danger"
      onClick={handleSignOut}
      aria-label="Sign out of your account"
    >
      Sign out
    </button>
  );
}
