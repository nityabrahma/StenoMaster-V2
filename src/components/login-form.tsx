
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { BookOpen, GraduationCap, LogIn, Loader2 } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { toast } from '@/hooks/use-toast';

const LoginForm = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const userTypesNav = [
    { name: 'Student', value: 'student', icon: BookOpen },
    { name: 'Teacher', value: 'teacher', icon: GraduationCap },
  ];

  const { login } = useAuth();
  const [studentCredentials, setStudentCredentials] = useState({
    email: '',
    password: '',
  });
  const [teacherCredentials, setTeacherCredentials] = useState({
    email: '',
    password: '',
  });
  const [activeTab, setActiveTab] = useState('student');
  const { colorScheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent, role: 'student' | 'teacher') => {
    e.preventDefault();
    setIsLoading(true);

    const credentials = role === 'student' ? studentCredentials : teacherCredentials;

    if (!credentials.email.trim() || !credentials.password.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    try {
        await login({
            email: credentials.email,
            password: credentials.password,
            role,
        });
        onLoginSuccess?.();
    } catch (error) {
        // Error toast is handled in the auth provider
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card
      className={`w-full max-w-md mx-auto flex flex-col overflow-auto backdrop-blur-xl border shadow-xl ${
        colorScheme === 'dark'
          ? 'bg-black/20 border-white/10'
          : 'bg-white/20 border-white/30'
      }`}
    >
      <CardHeader className="flex flex-col gap-2 justify-center items-center pb-2">
        <p
          className={`font-bold ${
            colorScheme === 'dark' ? 'text-dark' : 'text-light'
          }`}
        >
          Welcome! Please authorize to continue.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2">
            {userTypesNav.map((nav, index) => (
              <TabsTrigger
                key={index}
                value={nav.value}
                className={`cursor-pointer p-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white ${
                  colorScheme === 'dark' ? 'bg-slate-900' : 'bg-slate-300/80'
                }`}
              >
                <nav.icon className="h-4 w-4 mr-2" />
                {nav.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="student">
            <form onSubmit={(e) => handleLogin(e, 'student')} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  placeholder="Enter your email"
                  value={studentCredentials.email}
                  onChange={(e) =>
                    setStudentCredentials((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-password">Password</Label>
                <Input
                  id="student-password"
                  type="password"
                  placeholder="Enter your password"
                  value={studentCredentials.password}
                  onChange={(e) =>
                    setStudentCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                />
              </div>
              <Button
                disabled={isLoading}
                type="submit"
                className="gradient-button w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Sign In as Student
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="teacher">
            <form onSubmit={(e) => handleLogin(e, 'teacher')} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  placeholder="Enter your email"
                  value={teacherCredentials.email}
                  onChange={(e) =>
                    setTeacherCredentials((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-password">Password</Label>
                <Input
                  id="teacher-password"
                  type="password"
                  placeholder="Enter your password"
                  value={teacherCredentials.password}
                  onChange={(e) =>
                    setTeacherCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                />
              </div>
              <Button
                disabled={isLoading}
                type="submit"
                className="gradient-button w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Sign In as Teacher
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
