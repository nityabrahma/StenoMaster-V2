
'use client';

import { useAuth } from '@/hooks/use-auth';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import TypingTest from '@/components/typing-test';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useAssignments } from '@/hooks/use-assignments';
import type { SubmissionResult } from '@/components/typing-test';
import { useAppRouter } from '@/hooks/use-app-router';

export default function AssignmentPage() {
  const { user } = useAuth();
  const router = useAppRouter();
  const params = useParams();
  const { toast } = useToast();
  const { assignments, addSubmission } = useAssignments();

  const assignmentId = typeof params.id === 'string' ? params.id : '';
  const assignment = assignments.find((a) => a.id === assignmentId);

  if (!assignment) {
    notFound();
  }

  const handleSubmit = async (result: SubmissionResult) => {
    if (!user) return;

    const newSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId: assignment.id,
      studentId: user.id,
      submittedAt: new Date().toISOString(),
      ...result,
    };
    
    addSubmission(newSubmission);
    
    toast({
        title: "Assignment Submitted!",
        description: `Your score: ${result.wpm} WPM at ${result.accuracy.toFixed(1)}% accuracy.`,
    });

    router.push('/dashboard/assignments');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
        </Button>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{assignment.title}</CardTitle>
          <CardDescription>
            Due by: {format(new Date(assignment.deadline), 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignment.imageUrl && (
            <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
              <Image
                src={assignment.imageUrl}
                alt={assignment.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
          <TypingTest text={assignment.text} onComplete={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
