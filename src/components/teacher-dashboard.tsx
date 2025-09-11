'use client';
import { BarChart, Book, Users, ClipboardCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { students, classes, assignments, submissions } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

const chartData = [
  { class: 'Intro to Steno', avgWpm: 45 },
  { class: 'Advanced Typing', avgWpm: 68 },
  { class: 'Legal Transcription', avgWpm: 55 },
  { class: 'Medical Steno', avgWpm: 62 },
];

const chartConfig = {
  avgWpm: {
    label: 'Avg. WPM',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function TeacherDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== 'teacher') return null;

  const totalStudents = students.length;
  const totalClasses = classes.filter(c => c.teacherId === user.id).length;
  const totalAssignments = assignments.filter(a => classes.some(c => c.id === a.classId && c.teacherId === user.id)).length;

  const recentSubmissions = submissions.slice(0, 5).map(sub => {
      const student = students.find(s => s.id === sub.studentId);
      const assignment = assignments.find(a => a.id === sub.assignmentId);
      return { ...sub, student, assignment };
  });

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Here's a summary of your activities.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Classes</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Class Performance</CardTitle>
            <CardDescription>Average Words Per Minute (WPM) across your top classes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <RechartsBarChart data={chartData} accessibilityLayer>
                <XAxis dataKey="class" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-right">WPM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.map(sub => (
                    <TableRow key={sub.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://avatar.vercel.sh/${sub.student?.email}.png`} />
                                    <AvatarFallback>{sub.student?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{sub.student?.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="truncate max-w-[120px]">{sub.assignment?.title}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={sub.wpm > 60 ? "default" : "secondary"}>{sub.wpm}</Badge>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
