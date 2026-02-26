export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalFrameProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  isBusy?: boolean;
}
