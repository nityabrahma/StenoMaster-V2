
'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useAuth } from '@/hooks/use-auth';
import UserButton from '@/components/UserButton';
import Logo from '@/components/logo';
import { useAppRouter } from '@/hooks/use-app-router';
import { useAssignments } from '@/hooks/use-assignments';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useAppRouter();
    const { fetchAssignments } = useAssignments();
    const { fetchClasses } = useClasses();
    const { fetchStudents } = useStudents();
    const [dataLoaded, setDataLoaded] = useState(false);


    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/');
        }
    }, [loading, isAuthenticated, router]);
    
    useEffect(() => {
        const loadData = async () => {
            if (user && !dataLoaded) {
                await Promise.all([
                    fetchAssignments(),
                    fetchClasses(),
                    fetchStudents()
                ]);
                setDataLoaded(true);
            }
        };
        loadData();
    }, [user, dataLoaded, fetchAssignments, fetchClasses, fetchStudents]);

    if (loading || !isAuthenticated || !dataLoaded) {
        // The global loading provider will show an overlay
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
                            <Logo />
                            <SidebarTrigger
                                className="h-9 w-9 cursor-pointer bg-card/80 hover:bg-black/60"
                            />
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
    // AuthProvider is already in the root layout, so we don't need it here.
    return <DashboardLayout>{children}</DashboardLayout>
}
