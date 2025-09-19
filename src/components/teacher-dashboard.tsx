
'use client';
import { Users, Book, ClipboardCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useStudents } from '@/hooks/use-students';
import { useClasses } from '@/hooks/use-classes';
import { useDataStore } from '@/hooks/use-data-store';
import { useAppRouter } from '@/hooks/use-app-router';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { students } = useStudents();
  const { classes } = useClasses();
  const { assignments } = useDataStore();
  const router = useAppRouter();

  if (!user || user.role !== 'teacher') return null;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);
  const teacherClassIds = teacherClasses.map(c => c.id);
  
  const teacherAssignments = assignments.filter(a => teacherClassIds.includes(a.classId));
  const teacherStudents = students.filter(s => s.teacherId === user.id);

  const stats = [
    { title: 'Total Students', value: teacherStudents.length, icon: Users, color: 'from-blue-400 to-sky-400' },
    { title: 'Your Classes', value: teacherClasses.length, icon: Book, color: 'from-violet-400 to-purple-400' },
    { title: 'Active Assignments', value: teacherAssignments.length, icon: ClipboardCheck, color: 'from-emerald-400 to-green-400' },
  ];
  
  const recentAssignments = [...teacherAssignments]
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
    .slice(0, 5);


  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Here's a summary of your activities.</p>
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

      <div className="grid gap-8 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Classes</CardTitle>
            <CardDescription>A quick look at the classes you manage.</CardDescription>
          </CardHeader>
          <CardContent>
             {teacherClasses.length > 0 ? (
                <div className="space-y-4">
                     <ScrollArea className="h-[200px]">
                        <div className="divide-y divide-border">
                            {teacherClasses.map(cls => (
                                <div key={cls.id} className="flex justify-between items-center py-3">
                                    <div>
                                        <p className="font-semibold">{cls.name}</p>
                                        <p className="text-sm text-muted-foreground">{cls.students.length} students</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/classes')}>Manage</Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            ) : (
              <div className="text-center text-muted-foreground p-8">You haven't created any classes yet.</div>
            )}
          </CardContent>
           <CardFooter>
                <Button className="w-full" onClick={() => router.push('/dashboard/classes')}>Create New Class</Button>
           </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Assignments</CardTitle>
            <CardDescription>Your 5 most recently created assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAssignments.length > 0 ? (
                <div className="space-y-4">
                     <ScrollArea className="h-[200px]">
                        <div className="divide-y divide-border">
                            {recentAssignments.map(assignment => (
                                <div key={assignment.id} className="flex justify-between items-center py-3">
                                     <div>
                                        <p className="font-semibold truncate">{assignment.title}</p>
                                        <p className="text-sm text-muted-foreground">Due: {format(new Date(assignment.deadline), 'PP')}</p>
                                    </div>
                                    <Badge variant="outline">{classes.find(c => c.id === assignment.classId)?.name}</Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            ) : (
              <div className="text-center text-muted-foreground p-8">No assignments have been created yet.</div>
            )}
          </CardContent>
           <CardFooter>
                <Button className="w-full" onClick={() => router.push('/dashboard/assignments/new')}>Create New Assignment</Button>
           </CardFooter>
        </Card>
      </div>
    </div>
  );
}
