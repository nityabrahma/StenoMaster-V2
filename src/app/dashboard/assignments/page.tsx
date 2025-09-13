
'use client';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MoreHorizontal, PlusCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';
import { useAssignments } from '@/hooks/use-assignments';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useState } from 'react';
import type { Assignment, Submission } from '@/lib/types';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';

// Teacher's View
function TeacherAssignments() {
  const { user } = useAuth();
  const router = useRouter();
  const { assignments, submissions } = useAssignments();
  const { classes } = useClasses();

  if(!user) return null;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);
  const teacherAssignments = assignments.filter(a => teacherClasses.some(tc => tc.id === a.classId));
  
  return (
    <Card>
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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teacherAssignments.map(assignment => {
              const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
              const assignmentClass = classes.find(c => c.id === assignment.classId);
              return (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{assignmentClass?.name}</TableCell>
                  <TableCell>{format(new Date(assignment.deadline), 'PP')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{assignmentSubmissions.length} / {assignmentClass?.studentIds.length}</Badge>
                  </TableCell>
                  <TableCell>
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
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Student's View
function StudentAssignments() {
  const { user } = useAuth();
  const { students } = useStudents();
  const { assignments, submissions } = useAssignments();
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  if(!user) return null;

  const student = students.find(s => s.id === user.id);
  const myAssignments = assignments.filter(a => student?.classIds.includes(a.classId));
  const mySubmissions = submissions.filter(s => s.studentId === user.id);
  
  const completedAssignments = myAssignments.filter(a => mySubmissions.some(s => s.assignmentId === a.id));
  const pendingAssignments = myAssignments.filter(a => !mySubmissions.some(s => s.assignmentId === a.id));
  
  const handleCardClick = (assignment: Assignment, submission?: Submission) => {
    if (submission) {
      setSelectedAssignment(assignment);
      setSelectedSubmission(submission);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">My Assignments</h1>
      <p className="text-muted-foreground mb-6">Here are all your assignments. Keep up the great work!</p>
      
      {/* Pending Assignments */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-headline mb-4">Pending</h2>
        {pendingAssignments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingAssignments.map((assignment) => {
              const isPastDue = new Date(assignment.deadline) < new Date();
              return (
                <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`} passHref>
                  <Card className="flex flex-col h-full cursor-pointer">
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
                        Due {format(new Date(assignment.deadline), 'PPp')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">Click to start this assignment.</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <span>{isPastDue ? 'Submit Late' : 'Start Assignment'}</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
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
        {completedAssignments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedAssignments.map((assignment) => {
              const submission = mySubmissions.find(s => s.assignmentId === assignment.id)!;
              return (
                <Card key={assignment.id} onClick={() => handleCardClick(assignment, submission)} className="flex flex-col cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="truncate pr-4">{assignment.title}</CardTitle>
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
                  <CardFooter>
                    <p className="text-xs text-muted-foreground w-full text-center">Click to review submission</p>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">You haven't completed any assignments yet.</p>
        )}
      </div>

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
    <div className="container mx-auto p-4 md:p-8">
      {user.role === 'teacher' ? <TeacherAssignments /> : <StudentAssignments />}
    </div>
  );
}
