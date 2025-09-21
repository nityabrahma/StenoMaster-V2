
'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useStudents } from '@/hooks/use-students';
import { useAssignments } from '@/hooks/use-assignments';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BookOpen, CheckCircle } from 'lucide-react';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';
import type { Submission, Assignment } from '@/lib/types';
import { typingTexts } from '@/lib/typing-data';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StudentPerformancePage() {
  const params = useParams();
  const { user } = useAuth();
  const { students } = useStudents();
  const { assignments, submissions } = useAssignments();

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const student = students.find((s) => s.id === studentId);

  if (!student) {
    notFound();
  }

  if (!user || (user.role === 'student' && user.id !== student.id)) {
    return <p>Access Denied.</p>;
  }

  const studentSubmissions = submissions
    .filter((s) => s.studentId === student.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const getAssignmentForSubmission = (submission: Submission): Assignment => {
    if (submission.assignmentId.startsWith('practice-')) {
      const textId = submission.assignmentId.replace('practice-', '');
      const practiceText = typingTexts.find((t) => t.id === textId);
      return {
        id: submission.assignmentId,
        title: `Practice: ${practiceText?.text.substring(0, 20)}...` || 'Practice Text',
        text: practiceText?.text || 'Text not found.',
        classId: '',
        deadline: '',
      };
    }
    const assignment = assignments.find((a) => a.id === submission.assignmentId);
    return (
      assignment || {
        id: submission.assignmentId,
        title: 'Unknown Assignment',
        text: 'Assignment text not available.',
        classId: '',
        deadline: '',
      }
    );
  };

  const handleRowClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setSelectedAssignment(getAssignmentForSubmission(submission));
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setSelectedAssignment(null);
  };

  const nameParts = student.name.split(' ');
  const studentInitials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : student.name.substring(0, 2);

  return (
    <>
      {selectedSubmission && selectedAssignment && (
        <SubmissionReviewModal
          isOpen={true}
          onClose={closeModal}
          submission={selectedSubmission}
          assignment={selectedAssignment}
        />
      )}
      <div className="container mx-auto p-4 md:p-8 h-full flex flex-col gap-4">
        <Card className="flex-shrink-0">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} />
                <AvatarFallback>{studentInitials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-headline text-3xl">{student.name}</CardTitle>
                <CardDescription>{student.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="flex-1 min-h-0">
            <CardHeader>
                <CardTitle>Submission History</CardTitle>
                <CardDescription>Click on a submission to review the details.</CardDescription>
            </CardHeader>
          <CardContent className="h-[calc(100%-7.5rem)] flex flex-col">
             <div className="grid grid-cols-[2fr_1fr_2fr_repeat(3,minmax(0,1fr))] gap-4 px-4 pb-2 border-b font-semibold text-muted-foreground">
                <div className="text-center">Assignment</div>
                <div className="text-center">Type</div>
                <div className="text-center">Submitted On</div>
                <div className="text-right">WPM</div>
                <div className="text-right">Accuracy</div>
                <div className="text-right">Mistakes</div>
            </div>
            {studentSubmissions.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    This student has not submitted any assignments or practice tests yet.
                </div>
            ) : (
            <ScrollArea className="h-full">
                <div className="divide-y divide-border">
                    {studentSubmissions.map((submission) => {
                    const assignment = getAssignmentForSubmission(submission);
                    const isPractice = assignment.id.startsWith('practice-');
                    return (
                        <div
                            key={submission.id}
                            onClick={() => handleRowClick(submission)}
                            className="grid grid-cols-[2fr_1fr_2fr_repeat(3,minmax(0,1fr))] gap-4 px-4 py-3 items-center cursor-pointer hover:bg-muted/50"
                        >
                            <div className="font-medium truncate text-center">{assignment.title}</div>
                            <div className="text-center">
                                {isPractice ? (
                                <Badge variant="secondary" className="items-center">
                                    <BookOpen className="mr-1 h-3 w-3" /> Practice
                                </Badge>
                                ) : (
                                <Badge variant="default" className="bg-green-600 items-center">
                                    <CheckCircle className="mr-1 h-3 w-3" /> Assignment
                                </Badge>
                                )}
                            </div>
                            <div className="truncate text-center">{format(new Date(submission.submittedAt), 'PPp')}</div>
                            <div className="font-semibold text-right">{submission.wpm}</div>
                            <div className="text-right">{submission.accuracy.toFixed(1)}%</div>
                            <div className="text-right">{submission.mistakes}</div>
                        </div>
                    );
                    })}
                </div>
            </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
