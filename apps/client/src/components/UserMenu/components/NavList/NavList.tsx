'use client';

import clsx from 'clsx';

import type { NavItem } from '../../UserMenu.types';

import { isActive } from './NavList.utils';

import styles from './NavList.module.scss';

export function NavList({
  items,
  pathname,
  onSelect,
}: {
  items: NavItem[];
  pathname: string | null;
  onSelect: (href: string) => void;
}) {
  return (
    <div className={styles.navList}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <button
            key={item.href}
            type="button"
            className={clsx(styles.navItem, active && styles.active)}
            onClick={() => onSelect(item.href)}
          >
            <span className={styles.navLeft}>
              {item.icon ? <i className={clsx('bi', item.icon, styles.icon)} aria-hidden="true" /> : null}
              <span className={styles.label}>{item.label}</span>
            </span>

            <i className={clsx('bi bi-chevron-right', styles.chevron)} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
