'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from '@/hooks/use-theme';
import Logo from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useScore } from '@/hooks/useScore';
import { Card, CardContent } from '@/components/ui/card';
import UserButton from '@/components/UserButton';
import type { User, Class } from '@/lib/types';
import { AuthProvider } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme } = useTheme();
  const { user, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAssignmentPage = pathname.startsWith('/dashboard/assignments/');

  const [initialLoad, setInitialLoad] = useState(true);

  const {
    fetchAssignments,
    fetchClasses,
    setAssignments,
    fetchScores,
    fetchClassesForTeacher,
    fetchStudentsInClass,
    fetchScoresForTeacher,
  } = useScore();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/?showLogin=true');
    }
  }, [loading, isAuthenticated, router]);
  
  useEffect(() => {
    const loadData = async () => {
      if (user && isAuthenticated && initialLoad) {
        if (user.role === 'student') {
          const studentClasses = await fetchClasses(user);
          await fetchScores(user.id);
          if (studentClasses.length > 0) {
            await fetchAssignments(studentClasses[0].id);
          } else {
            setAssignments([]);
          }
        } else if (user.role === 'teacher') {
          await fetchScoresForTeacher(user);
          const teacherClasses: Class[] = await fetchClassesForTeacher(user);
          if (teacherClasses.length > 0) {
            for (const c of teacherClasses) {
              await fetchStudentsInClass(c.id);
            }
          }
          await fetchAssignments();
        }
        setInitialLoad(false);
      }
    };
    loadData();
  }, [user, isAuthenticated, initialLoad, fetchClasses, fetchScores, fetchAssignments, setAssignments, fetchClassesForTeacher, fetchStudentsInClass, fetchScoresForTeacher]);

  if (loading || !user || initialLoad) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            </div>
        </div>
    );
  }

  const handleBack = () => {
    window.history.back();
  }

  return (
    <SidebarProvider>
        <div className={`h-screen w-full flex flex-col bg-gradient-to-br ${
          colorScheme === 'dark'
            ? 'from-slate-900 via-slate-800 to-slate-900'
            : 'from-slate-50 via-blue-50 to-slate-100'
        }`}>
            <nav className="border-b h-16 flex-shrink-0 border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex justify-between items-center h-16 px-4 lg:px-6">
                    <div className="flex items-center space-x-4">
                        <div className="md:hidden">
                            <SidebarTrigger
                                className={`h-9 w-9 cursor-pointer ${
                                colorScheme === 'dark'
                                    ? 'bg-slate-900/70 hover:bg-black/60'
                                    : 'bg-slate-200 hover:bg-slate-300'
                                }`}
                            />
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                           <Logo />
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleBack}>
                            <ArrowLeft />
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        <ThemeToggle />
                        <UserButton />
                    </div>
                </div>
            </nav>
            <div className="flex flex-1 h-[calc(100vh-4rem)]">
                <AppSidebar />
                <main className="flex-1 p-2 sm:p-4 lg:p-8 overflow-auto size-full">
                    {children}
                </main>
            </div>
        </div>
    </SidebarProvider>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardLayout>{children}</DashboardLayout>
        </AuthProvider>
    )
}
