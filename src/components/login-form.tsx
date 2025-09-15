
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth-provider';
import { BookOpen, GraduationCap, LogIn, Loader2 } from 'lucide-react';

const LoginForm = () => {
  const userTypesNav = [
    { name: 'Student', value: 'student', icon: BookOpen },
    { name: 'Teacher', value: 'teacher', icon: GraduationCap },
  ];

  const { login, loading } = useAuth();
  const [studentCredentials, setStudentCredentials] = useState({
    email: '',
    password: '',
  });
  const [teacherCredentials, setTeacherCredentials] = useState({
    email: '',
    password: '',
  });
  const [activeTab, setActiveTab] = useState('student');

  const handleLogin = async (e: React.FormEvent, role: 'student' | 'teacher') => {
    e.preventDefault();
    const credentials = role === 'student' ? studentCredentials : teacherCredentials;
    await login({ ...credentials, role });
  };

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col"
    >
        <p
          className="font-semibold text-center text-gray-300 pb-4"
        >
          Welcome! Please authorize to continue.
        </p>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-black/20">
            {userTypesNav.map((nav, index) => (
              <TabsTrigger
                key={index}
                value={nav.value}
                className="cursor-pointer p-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-300"
              >
                <nav.icon className="h-4 w-4 mr-2" />
                {nav.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="student">
            <form onSubmit={(e) => handleLogin(e, 'student')} className="space-y-4 mt-4">
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
                  className="bg-black/20 border-white/10 focus:border-blue-500 transition-colors"
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
                  className="bg-black/20 border-white/10 focus:border-blue-500 transition-colors"
                />
              </div>
              <Button
                disabled={loading}
                type="submit"
                className="gradient-button w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Sign In as Student
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="teacher">
            <form onSubmit={(e) => handleLogin(e, 'teacher')} className="space-y-4 mt-4">
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
                  className="bg-black/20 border-white/10 focus:border-blue-500 transition-colors"
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
                  className="bg-black/20 border-white/10 focus:border-blue-500 transition-colors"
                />
              </div>
              <Button
                disabled={loading}
                type="submit"
                className="gradient-button w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Sign In as Teacher
              </Button>
            </form>
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default LoginForm;
