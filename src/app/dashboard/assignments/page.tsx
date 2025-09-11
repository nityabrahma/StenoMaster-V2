'use client';
import { useAuth } from '@/hooks/use-auth';
import { assignments, classes, students, submissions } from '@/lib/data';
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
import { MoreHorizontal, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

// Teacher's View
function TeacherAssignments() {
  const { user } = useAuth();
  const teacherClasses = classes.filter(c => c.teacherId === user?.id);
  const teacherAssignments = assignments.filter(a => teacherClasses.some(tc => tc.id === a.classId));

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-2xl">Manage Assignments</CardTitle>
                    <CardDescription>Create, view, and manage assignments for your classes.</CardDescription>
                </div>
                <Button>
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
  const student = students.find(s => s.id === user?.id);
  const myAssignments = assignments.filter(a => student?.classIds.includes(a.classId));
  const mySubmissions = submissions.filter(s => s.studentId === user?.id);
  
  const assignmentColors = [
    'from-blue-500 to-sky-500',
    'from-violet-500 to-purple-500',
    'from-emerald-500 to-green-500',
    'from-amber-500 to-yellow-500',
    'from-rose-500 to-red-500',
  ];

  return (
    <div>
        <h1 className="text-3xl font-bold font-headline mb-2">My Assignments</h1>
        <p className="text-muted-foreground mb-6">Here are all your assignments. Keep up the great work!</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {myAssignments.map((assignment, index) => {
            const submission = mySubmissions.find(s => s.assignmentId === assignment.id);
            const isCompleted = !!submission;
            const isPastDue = new Date(assignment.deadline) < new Date() && !isCompleted;
            const color = assignmentColors[index % assignmentColors.length];

            return (
                <Card key={assignment.id} className="flex flex-col relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <CardHeader className="relative z-10">
                        <div className="flex justify-between items-start">
                            <CardTitle className="truncate pr-4">{assignment.title}</CardTitle>
                            {isCompleted ? (
                                <Badge variant="default" className="bg-green-600">
                                    <CheckCircle className="mr-1 h-3 w-3" /> Completed
                                </Badge>
                            ) : isPastDue ? (
                                <Badge variant="destructive">Past Due</Badge>
                            ) : (
                                <Badge variant="secondary">Pending</Badge>
                            )}
                        </div>
                        <CardDescription>
                            Due {format(new Date(assignment.deadline), 'PPp')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow relative z-10">
                        {isCompleted && submission ? (
                             <div className="text-sm space-y-2">
                                <p><span className="font-semibold">Submitted:</span> {format(new Date(submission.submittedAt), 'PP')}</p>
                                <p><span className="font-semibold">Score:</span> {submission.wpm} WPM at {submission.accuracy.toFixed(1)}% accuracy</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">This assignment is pending. Complete it to see your score.</p>
                        )}
                    </CardContent>
                    <CardFooter className="relative z-10">
                        {!isCompleted && (
                            <Button asChild className="w-full">
                                <Link href={`/dashboard/assignments/${assignment.id}`}>
                                    {isPastDue ? 'Submit Late' : 'Start Assignment'}
                                </Link>
                            </Button>
                        )}
                         {isCompleted && (
                            <Button asChild variant="outline" className="w-full">
                                <Link href={`/dashboard/assignments/${assignment.id}`}>
                                    Review & Retry
                                </Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )
        })}
        </div>
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
