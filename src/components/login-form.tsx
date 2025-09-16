
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CheckUserResponse } from '@/lib/types';

type LoginStep = 'enter-email' | 'enter-password';

const LoginForm = () => {
  const { login, loading } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<LoginStep>('enter-email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data: CheckUserResponse = await res.json();

      if (res.ok && data.exists) {
        setRole(data.role!);
        setStep('enter-password');
      } else {
        toast({ title: data.message || 'No user found with this email.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'An error occurred', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    await login({ email, password, role });
  };
  
  const handleBack = () => {
    setStep('enter-email');
    setPassword('');
    setRole(null);
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col">
      {step === 'enter-email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4">
          <p className="font-semibold text-center text-gray-300 pb-4">
            Welcome! Enter your email to begin.
          </p>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/20 border-white/10 focus:border-blue-500 transition-colors"
            />
          </div>
          <Button
            disabled={loading}
            type="submit"
            className="gradient-button w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Continue'}
          </Button>
        </form>
      )}

      {step === 'enter-password' && (
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                    <ArrowLeft />
                </Button>
                <div>
                    <p className="font-semibold text-gray-300">Welcome back!</p>
                    <p className="text-sm text-muted-foreground -mt-1">{email}</p>
                </div>
            </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/20 border-white/10 focus:border-blue-500 transition-colors"
            />
          </div>
          <Button
            disabled={loading}
            type="submit"
            className="gradient-button w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
            Sign In
          </Button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
