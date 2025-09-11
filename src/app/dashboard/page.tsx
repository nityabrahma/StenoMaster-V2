'use client';
import { useAuth } from '@/hooks/use-auth';
import TeacherDashboard from '@/components/teacher-dashboard';
import StudentDashboard from '@/components/student-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
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

  return user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}
