
'use client';

import {
  createContext,
  useContext,
} from 'react';
import type { User, LoginCredentials, SignupCredentials } from '@/lib/types';


type AuthContextType = {
  user: User | null;
  loading: boolean;
  firstLoadDone: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
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
