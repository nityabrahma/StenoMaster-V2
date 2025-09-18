
'use client';

import {
  useMemo,
  useCallback,
  useState,
  useEffect
} from 'react';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@/hooks/use-auth';
import type { User, LoginCredentials, SignupCredentials } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/hooks/loading-provider';
import { useAppRouter } from './use-app-router';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { isLoading, setIsLoading } = useLoading();
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const router = useAppRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const logout = useCallback(() => {
    setIsLoading(true);
    setUser(null);
    
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
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
                setIsLoading(false);
            }
        }
    }
    validate();
  }, [pathname, firstLoadDone, setIsLoading]);

  const isAuthenticated = !!user;

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
            setIsLoading(false); // Important: stop loading on error
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
                  userType: credentials.role,
                  teacherId: credentials.teacherId,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            return data.data; // Return the nested data object on success
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
