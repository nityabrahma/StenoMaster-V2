'use client';

import {
  useMemo,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthContext } from '@/hooks/use-auth';

// This component is kept separate in case we need to add more providers
// or logic around the AuthProvider in the root layout.
// For now, it re-exports the functionality from the hook.

// Note: The main implementation is now inside `use-auth.tsx` to co-locate
// the context definition and the provider logic. This file structure is
// maintained for potential future expansion.

// Let's move the logic here to keep the hook file clean.

import {
  useState,
  useEffect,
} from 'react';
import type { User } from '@/lib/types';
import { students, teachers } from '@/lib/data';


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('steno-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('steno-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    (userId: string) => {
      const allUsers: User[] = [...teachers, ...students];
      const foundUser = allUsers.find((u) => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('steno-user', JSON.stringify(foundUser));
        router.push('/dashboard');
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('steno-user');
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
