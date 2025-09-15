
'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Logo from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import UserButton from '@/components/UserButton';
import { AuthProvider } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAssignments } from '@/hooks/use-assignments';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useAppRouter } from '@/hooks/use-app-router';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useAppRouter();
  
  const { loadAssignments } = useAssignments();
  const { loadClasses } = useClasses();
  const { loadStudents } = useStudents();
  
  // This state ensures data is loaded only once on initial mount
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && !dataLoaded) {
        await Promise.all([
            loadAssignments(),
            loadClasses(),
            loadStudents()
        ]);
        setDataLoaded(true);
      }
    };
    loadData();
  }, [isAuthenticated, dataLoaded, loadAssignments, loadClasses, loadStudents]);


  // The global loading provider now handles all loading states.
  // AuthProvider handles the redirect, so we just need to wait for the user.
  if (!user) {
    return null;
  }

  const handleBack = () => {
    router.back();
  }

  return (
    <SidebarProvider>
        <div className="h-screen w-full flex flex-col bg-transparent">
            <nav 
                className="h-16 flex-shrink-0 sticky top-0 z-20 bg-gray-900/30"
                style={{
                    backdropFilter: "blur(3px)"
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
