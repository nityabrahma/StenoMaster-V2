'use client';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PlusCircle, CheckCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppRouter } from '@/hooks/use-app-router';
import { useDataStore } from '@/hooks/use-data-store';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useState } from 'react';
import type { Assignment, Score } from '@/lib/types';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Teacher's View
function TeacherAssignments() {
  const { user } = useAuth();
  const router = useAppRouter();
  const { assignments, scores, deleteAssignment } = useDataStore();
  const { classes } = useClasses();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  if(!user) return null;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);
  const teacherAssignments = assignments.filter(a => teacherClasses.some(tc => tc.id === a.classId));

  const handleDelete = async (assignmentId: string, assignmentTitle: string) => {
    setIsDeleting(assignmentId);
    try {
        await deleteAssignment(assignmentId);
        toast({
            title: 'Assignment Deleted',
            description: `"${assignmentTitle}" and all its submissions have been removed.`,
        });
    } catch (error: any) {
        toast({
            title: 'Deletion Failed',
            description: error.message || 'Could not delete assignment.',
            variant: 'destructive',
        })
    } finally {
        setIsDeleting(null);
    }
  };
  
  return (
    <div className="h-full flex flex-col gap-4">
        <Card className="flex-shrink-0">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-2xl">Manage Assignments</CardTitle>
                        <CardDescription>Create, view, and manage assignments for your classes.</CardDescription>
                    </div>
                    <Button onClick={() => router.push('/dashboard/assignments/new')}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        New Assignment
                    </Button>
                </div>
            </CardHeader>
        </Card>
        <Card className="flex-1 min-h-0">
            <CardContent className="h-full p-6 flex flex-col">
                <div className="grid grid-cols-[3fr_2fr_2fr_1fr] gap-4 px-4 pb-2 border-b font-semibold text-muted-foreground">
                    <div>Title</div>
                    <div className="text-center">Class</div>
                    <div className="text-center">Due Date</div>
                    <div className="text-center">Actions</div>
                </div>
                 {teacherAssignments.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                        No assignments created yet.
                    </div>
                ) : (
                <ScrollArea className="h-full">
                    <TooltipProvider>
                        <div className="divide-y divide-border">
                            {teacherAssignments.map(assignment => {
                            const assignmentClass = classes.find(c => c.id === assignment.classId);
                            const isCurrentlyDeleting = isDeleting === assignment.id;
                            return (
                                <div key={assignment.id} className="grid grid-cols-[3fr_2fr_2fr_1fr] gap-4 px-4 py-3 items-center">
                                    <div className="font-medium truncate">{assignment.title}</div>
                                    <div className="truncate text-center">{assignmentClass?.name || 'N/A'}</div>
                                    <div className="truncate text-center">{format(new Date(assignment.deadline), 'PP')}</div>
                                    <div className="flex justify-center items-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/assignments/${assignment.id}/edit`)}>
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit Assignment</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Edit Assignment</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <AlertDialog>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete Assignment</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete Assignment</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the assignment "{assignment.title}" and all associated student submissions.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive hover:bg-destructive/90"
                                                    onClick={() => handleDelete(assignment.id, assignment.title)}
                                                    disabled={isCurrentlyDeleting}
                                                >
                                                    {isCurrentlyDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                    Yes, delete assignment
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    </TooltipProvider>
                </ScrollArea>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

// Student's View
function StudentAssignments() {
  const { user } = useAuth();
  const router = useAppRouter();
  const { assignments, scores } = useDataStore();
  
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  if(!user) return null;

  // Assignments are now pre-filtered by the data store
  const myAssignments = assignments;
  const myScores = scores.filter(s => s.studentId === user.id);
  
  const pendingAssignments = myAssignments.filter(a => a.isActive && !myScores.some(s => s.assignmentId === a.id));
  
  const handleCardClick = (assignment: Assignment, score?: Score) => {
    if (score && assignment) {
      setSelectedAssignment(assignment);
      setSelectedScore(score);
    }
  };

  const now = new Date();

  return (
    <div className="h-full flex flex-col gap-4">
      <Card className="flex-shrink-0">
          <CardHeader>
              <h1 className="text-3xl font-bold font-headline">My Assignments</h1>
              <p className="text-muted-foreground">Here are all your assignments. Keep up the great work!</p>
          </CardHeader>
      </Card>
      
      <ScrollArea className="flex-1">
        <div className="pr-4">
            {/* Pending Assignments */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold font-headline mb-4">Pending</h2>
                {pendingAssignments.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingAssignments.map((assignment) => {
                    const deadlineDate = new Date(assignment.deadline);
                    const isPastDue = deadlineDate < now;
                    return (
                        <Card key={assignment.id} className="flex flex-col h-full cursor-pointer" onClick={() => router.push(`/dashboard/assignments/${assignment.id}`)}>
                            <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="truncate pr-4">{assignment.title}</CardTitle>
                                {isPastDue ? (
                                <Badge variant="destructive">Past Due</Badge>
                                ) : (
                                <Badge variant="secondary">Pending</Badge>
                                )}
                            </div>
                            <CardDescription>
                                Due {format(deadlineDate, 'PPp')}
                            </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">Click to start this assignment.</p>
                            </CardContent>
                        </Card>
                    );
                    })}
                </div>
                ) : (
                <p className="text-muted-foreground">No pending assignments. Great job!</p>
                )}
            </div>

            {/* Completed Assignments */}
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Completed</h2>
                {myScores.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myScores.map((score) => {
                    const assignment = assignments.find(a => a.id === score.assignmentId);
                    const isDeleted = !assignment;

                    return (
                        <Card 
                        key={score.id} 
                        onClick={() => !isDeleted && handleCardClick(assignment!, score)} 
                        className={`flex flex-col ${!isDeleted ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                        >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="truncate pr-4">{assignment?.title || 'Deleted Assignment'}</CardTitle>
                                <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" /> Completed
                                </Badge>
                            </div>
                            <CardDescription>
                            Submitted {format(new Date(score.completedAt), 'PP')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="text-sm space-y-2">
                                <p><span className="font-semibold">Score:</span> {score.wpm} WPM</p>
                                <p><span className="font-semibold">Accuracy:</span> {score.accuracy.toFixed(1)}%</p>
                            </div>
                        </CardContent>
                        </Card>
                    );
                    })}
                </div>
                ) : (
                <p className="text-muted-foreground">You haven't completed any assignments yet.</p>
                )}
            </div>
        </div>
      </ScrollArea>

      {selectedScore && selectedAssignment && (
        <SubmissionReviewModal
          isOpen={!!selectedScore}
          onClose={() => {
            setSelectedScore(null);
            setSelectedAssignment(null);
          }}
          score={selectedScore}
          assignment={selectedAssignment}
        />
      )}
    </div>
  );
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="h-full p-4 md:p-8">
      {user.role === 'teacher' ? <TeacherAssignments /> : <StudentAssignments />}
    </div>
  );
}
