'use client';
import { Zap, Target, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { useAuth } from '@/hooks/use-auth';
import { assignments, submissions, students } from '@/lib/data';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  if (!user || user.role !== 'student') return null;

  const student = students.find(s => s.id === user.id);
  
  const mySubmissions = submissions.filter(s => s.studentId === user.id);
  const avgWpm = mySubmissions.length > 0 ? Math.round(mySubmissions.reduce((acc, s) => acc + s.wpm, 0) / mySubmissions.length) : 0;
  const avgAccuracy = mySubmissions.length > 0 ? (mySubmissions.reduce((acc, s) => acc + s.accuracy, 0) / mySubmissions.length).toFixed(1) : 0;

  const myAssignments = assignments.filter(a => student?.classIds.includes(a.classId));
  const pendingAssignments = myAssignments.filter(a => !mySubmissions.some(s => s.assignmentId === a.id));

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Hello, {user.name}!</h1>
        <p className="text-muted-foreground">Ready to improve your typing skills today?</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average WPM</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWpm}</div>
            <p className="text-xs text-muted-foreground">Your all-time average speed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAccuracy}%</div>
             <p className="text-xs text-muted-foreground">Your all-time average accuracy</p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="font-headline">Ready for a challenge?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-primary-foreground/80">Take a random typing test to warm up.</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/typing-test">Start Typing Test</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold font-headline mb-4">Pending Assignments</h2>
        {pendingAssignments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingAssignments.map(assignment => (
              <Card key={assignment.id}>
                <CardHeader>
                  <CardTitle className="truncate">{assignment.title}</CardTitle>
                  <CardDescription>Due {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{assignment.text.split(' ').length} words</span>
                  </div>
                </CardContent>
                 <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={`/dashboard/assignments/${assignment.id}`}>Start Assignment</Link>
                    </Button>
                 </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
             <CardTitle className="font-headline">All Caught Up!</CardTitle>
             <CardDescription className="mt-2">You have no pending assignments. Great job!</CardDescription>
          </Card>
        )}
      </div>
    </div>
  );
}
