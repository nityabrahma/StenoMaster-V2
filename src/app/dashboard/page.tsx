
'use client';
import { useAuth } from '@/hooks/use-auth';
import TeacherDashboard from '@/components/teacher-dashboard';
import StudentDashboard from '@/components/student-dashboard';
import { useLoading } from '@/hooks/loading-provider';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isLoading: isDataLoading } = useLoading();

  // The parent layout now handles the loading state and only renders this page
  // when data is ready. We just need to check for the user.
  if (!user || isDataLoading) {
    return null;
  }

  return user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}
