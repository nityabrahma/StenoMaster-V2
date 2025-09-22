'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CheckUserResponse } from '@/lib/types';

type LoginStep = 'enter-email' | 'enter-password';

const LoginForm = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<LoginStep>('enter-email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [name, setName] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const isLoading = isCheckingEmail || isLoggingIn;
  
  useEffect(() => {
    if (step === 'enter-password') {
      // Small timeout to allow the UI to update before focusing
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [step]);


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }

    setIsCheckingEmail(true);
    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data: CheckUserResponse = await res.json();

      if (res.ok && data.exists) {
        setRole(data.role!);
        setName(data.name || '');
        setStep('enter-password');
      } else {
        toast({ title: data.message || 'No user found with this email.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'An error occurred', description: 'Please try again later.', variant: 'destructive' });
    } finally {
        setIsCheckingEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setIsLoggingIn(true);
    try {
      await login({ email, password, role });
    } catch (error: any) {
        toast({
            title: 'Login Failed',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive'
        });
    } finally {
        setIsLoggingIn(false);
    }
  };
  
  const handleBack = () => {
    setStep('enter-email');
    setPassword('');
    setRole(null);
    setName('');
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col">
      {step === 'enter-email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <p className="font-semibold text-center text-foreground pb-1">
            Welcome! Enter your email to begin.
          </p>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card/80 border-border/50 focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            className="gradient-button w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Continue'}
          </Button>
        </form>
      )}

      {step === 'enter-password' && (
        <form onSubmit={handleLogin} className="space-y-3">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8" disabled={isLoading} type="button">
                    <ArrowLeft />
                </Button>
                <div>
                    <p className="font-semibold text-foreground">Welcome back, {name}!</p>
                    <p className="text-sm text-muted-foreground -mt-1">{email}</p>
                </div>
            </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              ref={passwordInputRef}
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card/80 border-border/50 focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            className="gradient-button w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
            Sign In
          </Button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
