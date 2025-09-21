'use client';

import { Suspense } from 'react';
import EditAssignmentPageContent from './page-content';
import { useParams, notFound } from 'next/navigation';
import { useDataStore } from '@/hooks/use-data-store';
import { useAuth } from '@/hooks/use-auth';

export default function EditAssignmentPage() {
  const params = useParams();
  const { user } = useAuth();
  const { assignments } = useDataStore();

  const assignmentId = typeof params.id === 'string' ? params.id : '';
  const assignment = assignments.find(a => a.id === assignmentId);

  if (!user || user.role !== 'teacher') return <p>Access Denied</p>;
  if (!assignment) {
    return notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditAssignmentPageContent assignment={assignment} />
    </Suspense>
  );
}
