
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BookOpen, CheckCircle } from 'lucide-react';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';
import type { Submission, Assignment } from '@/lib/types';
import { typingTexts } from '@/lib/typing-data';

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
      <div className="container mx-auto p-4 md:p-8">
        <Card>
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
          <CardContent>
            <h2 className="text-2xl font-bold font-headline mb-4">Submission History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>WPM</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Mistakes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentSubmissions.map((submission) => {
                  const assignment = getAssignmentForSubmission(submission);
                  const isPractice = assignment.id.startsWith('practice-');
                  return (
                    <TableRow
                      key={submission.id}
                      onClick={() => handleRowClick(submission)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>
                        {isPractice ? (
                          <Badge variant="secondary" className="items-center">
                            <BookOpen className="mr-1 h-3 w-3" /> Practice
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600 items-center">
                            <CheckCircle className="mr-1 h-3 w-3" /> Assignment
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(submission.submittedAt), 'PPp')}</TableCell>
                      <TableCell className="font-semibold">{submission.wpm}</TableCell>
                      <TableCell>{submission.accuracy.toFixed(1)}%</TableCell>
                      <TableCell>{submission.mistakes}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {studentSubmissions.length === 0 && (
                <p className="text-center text-muted-foreground mt-8">
                    This student has not submitted any assignments or practice tests yet.
                </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
