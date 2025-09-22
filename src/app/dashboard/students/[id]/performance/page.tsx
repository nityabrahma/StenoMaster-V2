
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useStudents } from '@/hooks/use-students';
import { useDataStore } from '@/hooks/use-data-store';
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
import { BookOpen, CheckCircle, Target, Trash2, Zap, Loader2 } from 'lucide-react';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';
import type { Score, Assignment } from '@/lib/types';
import { sampleTexts } from '@/lib/sample-text';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAppRouter } from '@/hooks/use-app-router';

export default function StudentPerformancePage() {
  const params = useParams();
  const router = useAppRouter();
  const { user } = useAuth();
  const { students, removeStudent } = useStudents();
  const { toast } = useToast();
  const { assignments, scores: allScores, fetchScoresByStudentId } = useDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const student = students.find((s) => s.id === studentId);

  useEffect(() => {
    if (studentId) {
      setIsLoading(true);
      fetchScoresByStudentId(studentId).finally(() => setIsLoading(false));
    }
  }, [studentId, fetchScoresByStudentId]);

  const handleDeleteStudent = async () => {
    if (!student) return;
    setIsDeleting(true);
    try {
        await removeStudent(student.id);
        toast({
            title: 'Student Removed',
            description: `${student.name} has been permanently deleted.`,
        });
        router.push('/dashboard/students');
    } catch (error: any) {
        toast({
            title: 'Deletion Failed',
            description: error.message || 'Could not remove the student.',
            variant: 'destructive',
        });
        setIsDeleting(false);
    }
  }

  if (!student) {
    if (!isLoading) return notFound();
    return null; // or a loading skeleton for the whole page
  }

  if (!user || (user.role === 'student' && user.id !== student.id)) {
    return <p>Access Denied.</p>;
  }

  const studentScores = allScores
    .filter((s) => s.studentId === student.id)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  
  const avgWpm = studentScores.length > 0 ? Math.round(studentScores.reduce((acc, s) => acc + s.wpm, 0) / studentScores.length) : 0;
  const avgAccuracy = studentScores.length > 0 ? (studentScores.reduce((acc, s) => acc + s.accuracy, 0) / studentScores.length).toFixed(1) : '0.0';


  const getAssignmentForScore = (score: Score): Assignment => {
    if (score.assignmentId.startsWith('practice-')) {
      const textId = score.assignmentId.replace('practice-', '');
      const practiceText = sampleTexts[parseInt(textId, 10) - 1];
      return {
        id: score.assignmentId,
        title: `Practice: ${practiceText?.substring(0, 20)}...` || 'Practice Text',
        text: practiceText || 'Text not found.',
        classId: '',
        deadline: '',
        isActive: true,
      };
    }
    const assignment = assignments.find((a) => a.id === score.assignmentId);
    return (
      assignment || {
        id: score.assignmentId,
        title: 'Unknown Assignment',
        text: 'Assignment text not available.',
        classId: '',
        deadline: '',
        isActive: false,
      }
    );
  };

  const handleRowClick = (score: Score) => {
    setSelectedScore(score);
    setSelectedAssignment(getAssignmentForScore(score));
  };

  const closeModal = () => {
    setSelectedScore(null);
    setSelectedAssignment(null);
  };

  const nameParts = student.name.split(' ');
  const studentInitials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : student.name.substring(0, 2);

  return (
    <>
      {selectedScore && selectedAssignment && (
        <SubmissionReviewModal
          isOpen={true}
          onClose={closeModal}
          score={selectedScore}
          assignment={selectedAssignment}
        />
      )}
      <div className="container mx-auto p-4 md:p-8 h-full flex flex-col gap-4">
        <Card className="flex-shrink-0">
          <CardContent className="p-4 flex justify-between items-start">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 relative">
                    <p className='absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center text-2xl bg-slate-800/50'>{studentInitials}</p>
                    <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} alt={student.name} />
                </Avatar>
                <div>
                    <CardTitle className="font-headline text-3xl">{student.name}</CardTitle>
                    <CardDescription>{student.email}</CardDescription>
                </div>
            </div>
            
            <div className="flex items-start gap-4">
                <div className="flex items-center gap-2">
                    <Card className='p-2 bg-background/50'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-0">
                            <CardTitle className="text-xs font-medium">Avg. WPM</CardTitle>
                            <Zap className="h-3 w-3 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className='p-2 pb-0'>
                            <div className="text-lg font-bold">{avgWpm}</div>
                        </CardContent>
                    </Card>
                    <Card className='p-2 bg-background/50'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-0">
                            <CardTitle className="text-xs font-medium">Avg. Acc</CardTitle>
                            <Target className="h-3 w-3 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className='p-2 pb-0'>
                            <div className="text-lg font-bold">{avgAccuracy}%</div>
                        </CardContent>
                    </Card>
                    <Card className='p-2 bg-background/50'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-0">
                            <CardTitle className="text-xs font-medium">Submissions</CardTitle>
                            <CheckCircle className="h-3 w-3 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className='p-2 pb-0'>
                            <div className="text-lg font-bold">{studentScores.length}</div>
                        </CardContent>
                    </Card>
                </div>
                 {user?.role === 'teacher' && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {student.name}'s account and all associated data.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={handleDeleteStudent}
                                disabled={isDeleting}
                            >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Yes, delete student
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
          </CardContent>
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
            {isLoading ? (
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : studentScores.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    This student has not submitted any assignments or practice tests yet.
                </div>
            ) : (
            <ScrollArea className="h-full">
                <div className="divide-y divide-border">
                    {studentScores.map((score) => {
                    const assignment = getAssignmentForScore(score);
                    const isPractice = assignment.id.startsWith('practice-');
                    return (
                        <div
                            key={score.id}
                            onClick={() => handleRowClick(score)}
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
                            <div className="truncate text-center">{format(new Date(score.completedAt), 'PPp')}</div>
                            <div className="font-semibold text-right">{score.wpm}</div>
                            <div className="text-right">{score.accuracy.toFixed(1)}%</div>
                            <div className="text-right">{score.mistakes.length}</div>
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
