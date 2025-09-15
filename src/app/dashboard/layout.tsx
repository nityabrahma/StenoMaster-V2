
'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useAuth } from '@/hooks/use-auth';
import UserButton from '@/components/UserButton';
import { AuthProvider } from '@/components/auth-provider';
import { useAssignments } from '@/hooks/use-assignments';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useAppRouter } from '@/hooks/use-app-router';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/logo';


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useAppRouter();
  const isMobile = useIsMobile();
  
  const { loadAssignments } = useAssignments();
  const { loadClasses } = useClasses();
  const { loadStudents } = useStudents();
  
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


  if (!user) {
    return null;
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
                        <SidebarTrigger
                            className="h-9 w-9 cursor-pointer bg-card/80 hover:bg-black/60"
                        />
                         {isMobile && <Logo />}
                    </div>
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                        <UserButton />
                    </div>
                </div>
            </nav>
            <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-auto size-full">
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
