'use client';

import { useNotify } from '@/components/NotificationContext/NotificationContext';
import { signoutUser } from '@/services';

export default function SignOutButton() {
  const notify = useNotify();

  async function handleSignOut() {
    try {
      await signoutUser();
      window.location.replace('/');
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
