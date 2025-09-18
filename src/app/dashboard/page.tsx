
'use client';
import { useAuth } from '@/hooks/use-auth';
import TeacherDashboard from '@/components/teacher-dashboard';
import StudentDashboard from '@/components/student-dashboard';
import { useLoading } from '@/hooks/loading-provider';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { isLoading: isDataLoading } = useLoading();

  if (loading || isDataLoading || !user) {
    return null;
  }

  return user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}
