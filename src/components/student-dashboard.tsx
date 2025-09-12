
'use client';
import { Zap, Target, BookOpen, Clock, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useAssignments } from '@/hooks/use-assignments';
import { useStudents } from '@/hooks/use-students';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { students } = useStudents();
  const { assignments, submissions } = useAssignments();
  
  if (!user || user.role !== 'student') return null;

  const student = students.find(s => s.id === user.id);
  
  const mySubmissions = submissions.filter(s => s.studentId === user.id);
  const avgWpm = mySubmissions.length > 0 ? Math.round(mySubmissions.reduce((acc, s) => acc + s.wpm, 0) / mySubmissions.length) : 0;
  const avgAccuracy = mySubmissions.length > 0 ? (mySubmissions.reduce((acc, s) => acc + s.accuracy, 0) / mySubmissions.length).toFixed(1) : 0;

  const myAssignments = assignments.filter(a => student?.classIds.includes(a.classId));
  const pendingAssignments = myAssignments.filter(a => !mySubmissions.some(s => s.assignmentId === a.id));
  
  const stats = [
    { title: 'Average WPM', value: avgWpm, icon: Zap, color: 'from-blue-500 to-sky-500' },
    { title: 'Average Accuracy', value: `${avgAccuracy}%`, icon: Target, color: 'from-violet-500 to-purple-500' },
    { title: 'Completed Assignments', value: mySubmissions.length, icon: ClipboardCheck, color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Hello, {user.name}!</h1>
        <p className="text-muted-foreground">Ready to improve your typing skills today?</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
                <Card key={index} className="group relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                            <Icon className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            )
        })}
        <Card className="bg-primary text-primary-foreground group relative overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="font-headline">Ready for a challenge?</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <p className="text-sm text-primary-foreground/80">Take a random typing test to warm up.</p>
            </CardContent>
            <CardFooter className="relative z-10">
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
              <Card key={assignment.id} className="relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="truncate">{assignment.title}</CardTitle>
                  <CardDescription>Due {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{assignment.text.split(' ').length} words</span>
                  </div>
                </CardContent>
                 <CardFooter className="relative z-10">
                    <Button asChild className="w-full">
                        <Link href={`/dashboard/assignments/${assignment.id}`}>Start Assignment</Link>
                    </Button>
                 </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
             <CardTitle className="font-headline relative z-10">All Caught Up!</CardTitle>
             <CardDescription className="mt-2 relative z-10">You have no pending assignments. Great job!</CardDescription>
          </Card>
        )}
      </div>
    </div>
  );
}
