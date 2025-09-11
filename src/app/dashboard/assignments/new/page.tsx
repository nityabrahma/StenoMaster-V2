
'use client';

import { Suspense } from 'react';
import NewAssignmentPageContent from './page-content';

export default function NewAssignmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewAssignmentPageContent />
    </Suspense>
  );
}
