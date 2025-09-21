
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
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/hooks/loading-provider';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { isLoading, setIsLoading } = useLoading();
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const router = useRouter(); // Using the standard Next.js router
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const logout = useCallback(() => {
    setIsLoading(true);
    setUser(null);
    // Also clear zustand stores and other local storage
    localStorage.removeItem('assignments-storage');
    localStorage.removeItem('classes-storage');
    localStorage.removeItem('students-storage');
    
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      // The redirect is handled by the useEffect which reacts to isAuthenticated
      setIsLoading(false);
      router.push('/');
    });
  }, [setIsLoading, router]);

  useEffect(() => {
    const validate = async () => {
        try {
            const res = await fetch('/api/auth/validate');
            if (res.ok) {
                const { user: validatedUser } = await res.json();
                setUser(validatedUser);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Validation failed:', error);
            setUser(null);
        } finally {
            if (!firstLoadDone) {
                setFirstLoadDone(true);
            }
        }
    }
    validate();
  }, [pathname]); // Re-validate on path change

  
  const isAuthenticated = !!user;

  // This effect handles the very first load of the application
  useEffect(() => {
    if(firstLoadDone) {
        setIsLoading(false);
    }
  }, [firstLoadDone, setIsLoading]);

  // Protected route handling
  useEffect(() => {
    if (firstLoadDone && !isLoading && !isAuthenticated && pathname.startsWith('/dashboard')) {
        const redirectUrl = `/`;
        router.push(redirectUrl);
    }
  }, [firstLoadDone, isLoading, isAuthenticated, pathname, router, searchParams]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            });
    
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.message || 'Login failed');
            }
            
            setUser(data.user);
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Authentication failed", error);
            toast({
                title: 'Login Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    },
    [router, toast, setIsLoading]
  );
  
  const signup = useCallback(
    async (credentials: SignupCredentials): Promise<any> => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  fullName: credentials.name,
                  email: credentials.email,
                  password: credentials.password,
                  userType: credentials.role
              }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            return data;
        } catch (error: any) {
            console.error("Signup failed", error);
            throw error; // Re-throw to be caught in the component
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
