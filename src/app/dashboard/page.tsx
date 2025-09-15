
'use client';
import { useAuth } from '@/hooks/use-auth';
import TeacherDashboard from '@/components/teacher-dashboard';
import StudentDashboard from '@/components/student-dashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    // The global loading provider will show an overlay, so we can return null here
    // to avoid layout shifts or skeleton flashes.
    return null;
  }

  return user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}
