
'use client';

import { useAppRouter } from '@/hooks/use-app-router';
import { useEffect } from 'react';

// This page is obsolete and now redirects to the main classes page.
export default function NewClassRedirect() {
  const router = useAppRouter();
  useEffect(() => {
    router.push('/dashboard/classes');
  }, [router]);

  return null;
}
