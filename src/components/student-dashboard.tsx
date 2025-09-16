
'use client';
import { Zap, Target, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useDataStore } from '@/hooks/use-data-store';
import { useStudents } from '@/hooks/use-students';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen } from 'lucide-react';
import { useAppRouter } from '@/hooks/use-app-router';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { students } = useStudents();
  const { assignments, scores } = useDataStore();
  const router = useAppRouter();
  
  if (!user || user.role !== 'student') return null;

  const student = students.find(s => s.id === user.id);
  
  const myScores = scores.filter(s => s.studentId === user.id);
  const avgWpm = myScores.length > 0 ? Math.round(myScores.reduce((acc, s) => acc + s.wpm, 0) / myScores.length) : 0;
  const avgAccuracy = myScores.length > 0 ? (myScores.reduce((acc, s) => acc + s.accuracy, 0) / myScores.length).toFixed(1) : 0;

  const myAssignments = assignments.filter(a => student?.classIds.includes(a.classId));
  const pendingAssignments = myAssignments.filter(a => !myScores.some(s => s.assignmentId === a.id));
  
  const stats = [
    { title: 'Average WPM', value: avgWpm, icon: Zap, color: 'from-blue-400 to-sky-400' },
    { title: 'Average Accuracy', value: `${avgAccuracy}%`, icon: Target, color: 'from-violet-400 to-purple-400' },
    { title: 'Completed', value: myScores.length, icon: ClipboardCheck, color: 'from-emerald-400 to-green-400' },
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
                <Card key={index} className="border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                            <Icon className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            )
        })}
      </div>
      
      <Card className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-primary-foreground border-none">
        <CardHeader>
            <CardTitle className="font-headline">Ready for a challenge?</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-blue-100">Take a random typing test to warm up.</p>
        </CardContent>
        <CardFooter>
            <Button variant="secondary" onClick={() => router.push('/dashboard/typing-test')}>
                Start Typing Test
            </Button>
        </CardFooter>
      </Card>


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
                    <Button className="w-full" onClick={() => router.push(`/dashboard/assignments/${assignment.id}`)}>Start Assignment</Button>
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
