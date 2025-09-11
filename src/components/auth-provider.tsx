'use client';

import {
  useMemo,
  useCallback,
  useState,
  useEffect
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/hooks/use-auth';
import type { User, LoginCredentials } from '@/lib/types';
import { signIn, decodeToken, isTokenExpired } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const TOKEN_STORAGE_KEY = 'steno-auth-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    if(pathname !== '/') {
        router.push('/');
    }
  }, [router, pathname]);

  useEffect(() => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        if (isTokenExpired(storedToken)) {
            console.log("Token expired, logging out.");
            logout();
        } else {
            const decodedUser = decodeToken(storedToken);
            if (decodedUser) {
                setUser(decodedUser as User);
            } else {
                logout();
            }
        }
      }
    } catch (error) {
      console.error('Failed to process token from localStorage', error);
      logout();
    } finally {
      setLoading(false);
      setFirstLoadDone(true);
    }
  }, [logout]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
        try {
            setLoading(true);
            const token = await signIn(credentials);
            const decodedUser = decodeToken(token);
             if (decodedUser) {
                setUser(decodedUser as User);
                localStorage.setItem(TOKEN_STORAGE_KEY, token);
                router.push('/dashboard');
            } else {
                throw new Error("Failed to decode token");
            }
        } catch (error: any) {
            console.error("Authentication failed", error);
            toast({
                title: 'Login Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive'
            });
            throw error;
        } finally {
            setLoading(false);
        }
    },
    [router, toast]
  );
  
  const isAuthenticated = !!user;

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated, firstLoadDone }),
    [user, loading, login, logout, isAuthenticated, firstLoadDone]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}