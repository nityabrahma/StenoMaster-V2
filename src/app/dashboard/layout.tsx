
'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useAuth } from '@/hooks/use-auth';
import UserButton from '@/components/UserButton';
import Logo from '@/components/logo';
import { useAppRouter } from '@/hooks/use-app-router';
import { useDataStore } from '@/hooks/use-data-store';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useLoading } from '@/hooks/loading-provider';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useAppRouter();
    const { fetchAssignments, fetchScores } = useDataStore();
    const { fetchClasses } = useClasses();
    const { fetchStudents } = useStudents();
    const { setIsLoading } = useLoading();
    const [dataLoaded, setDataLoaded] = useState(false);


    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/');
        }
    }, [loading, isAuthenticated, router]);
    
    useEffect(() => {
        const loadData = async () => {
            if (user && !dataLoaded) {
                // The loading state is already true from the router/auth provider
                const dataPromises = [
                    fetchAssignments(user.role),
                    fetchScores(5) // Fetch only the last 5 scores for recent activity feeds
                ];

                if (user.role === 'teacher') {
                    dataPromises.push(fetchClasses(), fetchStudents());
                } else {
                    dataPromises.push(fetchClasses()); // Students still need their class info
                }

                await Promise.all(dataPromises);

                setDataLoaded(true);
                // The loader will be turned off by the AppRouterProvider when the page transition completes
            }
        };
        loadData();
    }, [user, dataLoaded, fetchAssignments, fetchClasses, fetchStudents, fetchScores, setIsLoading]);

    // Don't return null. Let the page render so the loading overlay can work correctly.
    // The children are only rendered when data is loaded, preventing a flicker.
    return (
        <SidebarProvider>
            <div className="h-screen w-full flex flex-col bg-transparent">
                <nav
                    className="h-16 flex-shrink-0 sticky top-0 z-20 bg-background/30"
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
                        <div className="flex items-center space-x-2 lg:space-x-4">
                            <UserButton />
                        </div>
                    </div>
                </nav>
                <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto size-full">
                        {dataLoaded ? children : null}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>
}
