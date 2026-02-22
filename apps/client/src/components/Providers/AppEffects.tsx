'use client';

import { useAuth401Handler } from '@/auth';

export function AppEffects() {
  useAuth401Handler();
  return null;
}
