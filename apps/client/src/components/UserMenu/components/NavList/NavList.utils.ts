import { ROUTES } from '@/constants';

export function isActive(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  if (href === ROUTES.home) {
    return pathname === ROUTES.home;
  }

  return pathname.startsWith(href);
}
