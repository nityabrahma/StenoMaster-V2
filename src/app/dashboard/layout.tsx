
'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Logo from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import UserButton from '@/components/UserButton';
import { AuthProvider } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAssignments } from '@/hooks/use-assignments';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [initialLoad, setInitialLoad] = useState(true);
  
  const { loadAssignments } = useAssignments();
  const { loadClasses } = useClasses();
  const { loadStudents } = useStudents();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/?showLogin=true');
    }
  }, [loading, isAuthenticated, router]);
  
  useEffect(() => {
    const loadData = async () => {
      if (user && isAuthenticated && initialLoad) {
        await Promise.all([
            loadAssignments(),
            loadClasses(),
            loadStudents()
        ]);
        setInitialLoad(false);
      }
    };
    loadData();
  }, [user, isAuthenticated, initialLoad, loadAssignments, loadClasses, loadStudents]);

  if (loading || !user || initialLoad) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-transparent">
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
        <div className="h-screen w-full flex flex-col bg-transparent">
            <nav 
                className="h-16 flex-shrink-0 sticky top-0 z-20 bg-gray-900/30"
                style={{
                    backdropFilter: "blur(1px)"
                }}
            >
                <div className="flex justify-between items-center h-16 px-4 lg:px-6">
                    <div className="flex items-center space-x-4">
                        <div className="md:hidden">
                            <SidebarTrigger
                                className="h-9 w-9 cursor-pointer bg-card/80 hover:bg-black/60"
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
