
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useAppRouter } from '@/hooks/use-app-router';
import type { User, LoginCredentials, SignupCredentials } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/hooks/loading-provider';
import { useStudents } from './use-students';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<User | undefined>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useAppRouter();
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useLoading();
  const { fetchStudents } = useStudents();

  const validateAndSetUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/validate');
      if (res.ok) {
        const { user: validatedUser } = await res.json();
        setUser(validatedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      console.error("Validation failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  useEffect(() => {
    validateAndSetUser();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Login failed');
        }
        
        await validateAndSetUser();
        router.push('/dashboard');
        
      } catch (error: any) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        throw error;
      }
    },
    [setIsLoading, toast, router, validateAndSetUser]
  );
  
  const signup = useCallback(
    async (credentials: SignupCredentials): Promise<User | undefined> => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Signup failed');
            }
            const newUser = await res.json();
            
            if (newUser.role === 'student') {
                await fetchStudents();
            }

            return newUser;
        } catch (error: any) {
            console.error("Signup failed", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    },
    [setIsLoading, fetchStudents]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      // Clear client-side stores on logout
      window.localStorage.removeItem('assignments-storage');
      window.localStorage.removeItem('classes-storage');
      window.localStorage.removeItem('students-storage');
      router.push('/');
      setIsLoading(false);
    }
  }, [setIsLoading, router]);

  const value = useMemo(
    () => ({
      user,
      loading: isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      signup,
    }),
    [user, isLoading, login, logout, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
