
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
import { useLoading } from '@/hooks/loading-provider';

const TOKEN_STORAGE_KEY = 'steno-auth-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const router = useRouter(); // Using the standard Next.js router
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useLoading();

  const logout = useCallback(() => {
    setIsLoading(true);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    // Also clear zustand stores
    localStorage.removeItem('assignments-storage');
    localStorage.removeItem('classes-storage');
    localStorage.removeItem('students-storage');
    
    if(pathname.startsWith('/dashboard')) {
        router.push('/');
    } else {
        setIsLoading(false);
    }
  }, [router, pathname, setIsLoading]);

  useEffect(() => {
    try {
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
                logout(); // Token is invalid
            }
        }
      }
    } catch (error) {
      console.error('Failed to process token from localStorage', error);
      logout();
    } finally {
      setFirstLoadDone(true);
      // The loading state is managed by the router and initial load logic
    }
  }, [logout]);
  
  const isAuthenticated = !!user;

  useEffect(() => {
    if(firstLoadDone) {
        setIsLoading(false);
    }
  }, [firstLoadDone, setIsLoading]);

  // Protected route handling
  useEffect(() => {
    if (firstLoadDone && !isLoading && !isAuthenticated && pathname.startsWith('/dashboard')) {
        const redirectUrl = `/?redirect=${encodeURIComponent(pathname + searchParams.toString())}`;
        router.push(redirectUrl);
    }
  }, [firstLoadDone, isLoading, isAuthenticated, pathname, router, searchParams]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const token = await signIn(credentials);
            const decodedUser = decodeToken(token);
             if (decodedUser) {
                setUser(decodedUser as User);
                localStorage.setItem(TOKEN_STORAGE_KEY, token);

                const redirectPath = searchParams.get('redirect');
                if (redirectPath) {
                    router.push(redirectPath);
                } else {
                    router.push('/dashboard');
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
            setIsLoading(false); // Ensure loading is stopped on error
            throw error;
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
            throw error;
        } finally {
            setIsLoading(false);
        }
    },
    [setIsLoading]
  );

  const value = useMemo(
    () => ({ user, loading: isLoading, login, logout, isAuthenticated, firstLoadDone, signup }),
    [user, isLoading, login, logout, isAuthenticated, firstLoadDone, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
