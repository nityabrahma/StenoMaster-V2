
'use client';

import {
  useMemo,
  useCallback,
  useState,
  useEffect
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '@/hooks/use-auth';
import type { User, LoginCredentials, SignupCredentials } from '@/lib/types';
import { signIn, signUp, decodeToken, isTokenExpired } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/components/loading-provider';

const TOKEN_STORAGE_KEY = 'steno-auth-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setIsLoading } = useLoading();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    // Also clear zustand stores
    localStorage.removeItem('assignments-storage');
    localStorage.removeItem('classes-storage');
    localStorage.removeItem('students-storage');
    
    // If on a protected page, redirect to home. Otherwise, stay.
    if(pathname.startsWith('/dashboard')) {
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
  
  const isAuthenticated = !!user;

  // Protected route handling
  useEffect(() => {
    if (!loading && !isAuthenticated && pathname.startsWith('/dashboard')) {
        const redirectUrl = `/?showLogin=true&redirect=${encodeURIComponent(pathname + searchParams.toString())}`;
        router.push(redirectUrl);
    }
  }, [loading, isAuthenticated, pathname, router, searchParams]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            const token = await signIn(credentials);
            const decodedUser = decodeToken(token);
             if (decodedUser) {
                setUser(decodedUser as User);
                localStorage.setItem(TOKEN_STORAGE_KEY, token);

                const redirectPath = searchParams.get('redirect');
                if (redirectPath) {
                    router.push(redirectPath);
                } else {
                    router.push(`/dashboard?role=${(decodedUser as User).role}`);
                }
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
            setIsLoading(false);
        }
    },
    [router, toast, searchParams, setIsLoading]
  );
  
  const signup = useCallback(
    async (credentials: SignupCredentials): Promise<User> => {
        setIsLoading(true);
        try {
            const newUser = await signUp(credentials);
            return newUser;
        } catch (error: any) {
            console.error("Signup failed", error);
            // The toast is now thrown from the signup function itself
            throw error;
        } finally {
            setIsLoading(false);
        }
    },
    [setIsLoading]
  );

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated, firstLoadDone, signup }),
    [user, loading, login, logout, isAuthenticated, firstLoadDone, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
