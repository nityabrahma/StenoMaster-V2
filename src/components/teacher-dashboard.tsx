
'use client';
import { Users, Book, ClipboardCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { useStudents } from '@/hooks/use-students';
import { useClasses } from '@/hooks/use-classes';
import { useDataStore } from '@/hooks/use-data-store';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useMemo, useEffect, useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import type { Score } from '@/lib/types';

const chartConfig = {
  avgWpm: {
    label: 'Avg. WPM',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { students } = useStudents();
  const { classes } = useClasses();
  const { assignments, scores, fetchScores } = useDataStore();
  const [recentScores, setRecentScores] = useState<Score[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);

  useEffect(() => {
    const loadRecentScores = async () => {
        setIsLoadingScores(true);
        // We'll fetch just the last 5 scores for the dashboard
        await fetchScores(5); 
        setIsLoadingScores(false);
    }
    loadRecentScores();
  }, [fetchScores]);

  useEffect(() => {
    // This effect reacts to changes in the global scores state
    const sortedScores = [...scores].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    setRecentScores(sortedScores.slice(0, 5));
  }, [scores]);

  if (!user || user.role !== 'teacher') return null;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);
  const teacherClassIds = teacherClasses.map(c => c.id);
  
  const teacherAssignments = assignments.filter(a => teacherClassIds.includes(a.classId));
  const teacherStudents = students.filter(s => teacherClasses.some(c => c.studentIds.includes(s.id)));
  

  const chartData = useMemo(() => {
    return teacherClasses.map(cls => {
      const classAssignments = assignments.filter(a => a.classId === cls.id);
      const classScores = scores.filter(s => classAssignments.some(a => a.id === s.assignmentId) && cls.studentIds.includes(s.studentId));
      
      if (classScores.length === 0) {
        return { class: cls.name, avgWpm: 0 };
      }

      const totalWpm = classScores.reduce((acc, sub) => acc + sub.wpm, 0);
      const avgWpm = Math.round(totalWpm / classScores.length);

      return { class: cls.name, avgWpm };
    }).slice(0, 5); // show top 5 classes
  }, [teacherClasses, assignments, scores]);

  const stats = [
    { title: 'Total Students', value: teacherStudents.length, icon: Users, color: 'from-blue-400 to-sky-400' },
    { title: 'Your Classes', value: teacherClasses.length, icon: Book, color: 'from-violet-400 to-purple-400' },
    { title: 'Active Assignments', value: teacherAssignments.length, icon: ClipboardCheck, color: 'from-emerald-400 to-green-400' },
  ];

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
            <CardTitle className="font-headline">Class Performance</CardTitle>
            <CardDescription>Average Words Per Minute (WPM) across your classes. (Based on available scores)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <RechartsBarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="class" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    className="glass-card"
                    labelClassName="font-bold"
                    hideLabel 
                   />}
                />
                <Bar dataKey="avgWpm" fill="var(--color-avgWpm)" radius={8} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Latest assignment submissions from your students.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingScores ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : recentScores.length > 0 ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-[2fr_1.5fr_auto] gap-4 px-2 text-sm font-semibold text-muted-foreground border-b pb-2">
                        <div>Student</div>
                        <div>Assignment</div>
                        <div className="text-right">WPM</div>
                    </div>
                     <ScrollArea className="h-[200px]">
                        <div className="divide-y divide-border">
                            {recentScores.map(sub => {
                                const student = students.find(s => s.id === sub.studentId);
                                const assignment = assignments.find(a => a.id === sub.assignmentId);
                                return (
                                <div key={sub.id} className="grid grid-cols-[2fr_1.5fr_auto] gap-4 px-2 py-3 items-center">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://avatar.vercel.sh/${student?.email}.png`} />
                                            <AvatarFallback>{student?.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{student?.name}</span>
                                    </div>
                                    <div className="truncate">{assignment?.title}</div>
                                    <div className="text-right">
                                        <Badge variant={sub.wpm > 60 ? "default" : "secondary"}>{sub.wpm}</Badge>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </ScrollArea>
                </div>
            ) : (
              <div className="text-center text-muted-foreground p-8">No recent submissions.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
