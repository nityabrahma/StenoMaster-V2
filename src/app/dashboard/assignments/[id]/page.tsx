'use client';

import { useAuth } from '@/hooks/use-auth';
import { assignments } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import TypingTest from '@/components/typing-test';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function AssignmentPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const assignment = assignments.find((a) => a.id === params.id);

  if (!assignment) {
    notFound();
  }

  const handleSubmit = (result: { wpm: number; accuracy: number; mistakes: number }) => {
    console.log('Submitting assignment:', {
      assignmentId: assignment.id,
      studentId: user?.id,
      ...result,
    });
    
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
