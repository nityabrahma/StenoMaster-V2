
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import TeacherDashboard from '@/components/teacher-dashboard';
import StudentDashboard from '@/components/student-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');

  useEffect(() => {
    if (!loading && user && !role) {
      router.replace(`/dashboard?role=${user.role}`);
    }
  }, [user, loading, role, router]);

  if (loading || !user || !role) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 mt-8" />
      </div>
    );
  }

  if (user.role !== role) {
     return <p>Access Denied: Your role does not match the dashboard you are trying to view.</p>
  }

  return role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}
