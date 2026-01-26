'use server';

import { cache } from 'react';

import { getCurrentUser } from './getCurrentUser';

export const getCurrentUserServer = cache(getCurrentUser);
