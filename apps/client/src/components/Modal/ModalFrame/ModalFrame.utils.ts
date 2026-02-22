import type { ModalSize } from './ModalFrame.types';

import styles from './ModalFrame.module.scss';

export function sizeClass(size: ModalSize) {
  switch (size) {
    case 'sm':
      return styles.cardSm;
    case 'lg':
      return styles.cardLg;
    case 'md':
    default:
      return styles.cardMd;
  }
}
