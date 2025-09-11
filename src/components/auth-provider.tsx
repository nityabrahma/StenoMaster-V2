'use client';

import {
  useMemo,
  useCallback,
  useState,
  useEffect
} from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/hooks/use-auth';
import type { User } from '@/lib/types';
import { signIn, decodeToken, isTokenExpired } from '@/lib/auth';

const TOKEN_STORAGE_KEY = 'steno-auth-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        if (isTokenExpired(storedToken)) {
            console.log("Token expired, logging out.");
            logout();
        } else {
            const decodedUser = decodeToken(storedToken);
            setUser(decodedUser as User);
        }
      }
    } catch (error) {
      console.error('Failed to process token from localStorage', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(
    async (userId: string) => {
        try {
            const token = await signIn(userId);
            const decodedUser = decodeToken(token);
            setUser(decodedUser as User);
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            router.push('/dashboard');
        } catch (error) {
            console.error("Authentication failed", error);
            throw error; // Re-throw to be caught by the login page
        }
    },
    [router]
  );

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
