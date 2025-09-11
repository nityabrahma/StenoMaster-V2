'use client';

import {
  createContext,
  useContext,
} from 'react';
import type { User } from '@/lib/types';


type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
