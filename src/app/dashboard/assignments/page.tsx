
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
import { MoreHorizontal, PlusCircle, CheckCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useAppRouter } from '@/hooks/use-app-router';
import { useAssignments } from '@/hooks/use-assignments';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useState } from 'react';
import type { Assignment, Submission } from '@/lib/types';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Teacher's View
function TeacherAssignments() {
  const { user } = useAuth();
  const router = useAppRouter();
  const { assignments, submissions, deleteAssignment } = useAssignments();
  const { classes } = useClasses();
  const { toast } = useToast();

  if(!user) return null;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);
  const teacherAssignments = assignments.filter(a => teacherClasses.some(tc => tc.id === a.classId));

  const handleDelete = (assignmentId: string, assignmentTitle: string) => {
    deleteAssignment(assignmentId);
    toast({
        title: 'Assignment Deleted',
        description: `"${assignmentTitle}" has been removed. Student scores are retained.`,
    });
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
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 pb-2 border-b font-semibold text-muted-foreground">
                    <div className="text-center">Title</div>
                    <div className="text-center">Class</div>
                    <div className="text-center">Due Date</div>
                    <div className="text-center">Submissions</div>
                    <div className="w-8"><span className="sr-only">Actions</span></div>
                </div>
                <ScrollArea className="h-full">
                    <div className="divide-y divide-border">
                        {teacherAssignments.map(assignment => {
                        const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
                        const assignmentClass = classes.find(c => c.id === assignment.classId);
                        return (
                            <div key={assignment.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 items-center">
                                <div className="font-medium truncate text-center">{assignment.title}</div>
                                <div className="truncate text-center">{assignmentClass?.name}</div>
                                <div className="truncate text-center">{format(new Date(assignment.deadline), 'PP')}</div>
                                <div className="text-center">
                                    <Badge variant="outline">{assignmentSubmissions.length} / {assignmentClass?.studentIds.length}</Badge>
                                </div>
                                <div className="flex justify-center">
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>View Submissions</DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-destructive"
                                            onClick={() => handleDelete(assignment.id, assignment.title)}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                </ScrollArea>
                 {teacherAssignments.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        No assignments created yet.
                    </div>
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
  const { students } = useStudents();
  const { assignments, submissions } = useAssignments();
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  if(!user) return null;

  const student = students.find(s => s.id === user.id);
  const myAssignments = assignments.filter(a => student?.classIds.includes(a.classId));
  const mySubmissions = submissions.filter(s => s.studentId === user.id);
  
  const pendingAssignments = myAssignments.filter(a => !mySubmissions.some(s => s.assignmentId === a.id));
  
  const handleCardClick = (assignment: Assignment, submission?: Submission) => {
    if (submission && assignment) {
      setSelectedAssignment(assignment);
      setSelectedSubmission(submission);
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
                {mySubmissions.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mySubmissions.map((submission) => {
                    const assignment = assignments.find(a => a.id === submission.assignmentId);
                    const isDeleted = !assignment;

                    return (
                        <Card 
                        key={submission.id} 
                        onClick={() => handleCardClick(assignment!, submission)} 
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
                            Submitted {format(new Date(submission.submittedAt), 'PP')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="text-sm space-y-2">
                                <p><span className="font-semibold">Score:</span> {submission.wpm} WPM</p>
                                <p><span className="font-semibold">Accuracy:</span> {submission.accuracy.toFixed(1)}%</p>
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

      {selectedSubmission && selectedAssignment && (
        <SubmissionReviewModal
          isOpen={!!selectedSubmission}
          onClose={() => {
            setSelectedSubmission(null);
            setSelectedAssignment(null);
          }}
          submission={selectedSubmission}
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
