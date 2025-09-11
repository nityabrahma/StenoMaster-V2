'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import SidebarNav from '@/components/sidebar-nav';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [user, loading, isAuthenticated, router]);

  if (loading || !user) {
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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}