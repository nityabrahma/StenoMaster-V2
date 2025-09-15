
'use client';
import { useAuth } from '@/hooks/use-auth';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import type { Student } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useAppRouter } from '@/hooks/use-app-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function ClassesPage() {
  const { user } = useAuth();
  const router = useAppRouter();
  const { classes } = useClasses();
  const { students } = useStudents();

  if (!user || user.role !== 'teacher') return <p>Access Denied</p>;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl">Your Classes</CardTitle>
              <CardDescription>View and manage your class rosters.</CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/classes/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Class
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherClasses.map(cls => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2 overflow-hidden">
                        {cls.studentIds.slice(0, 5).map(studentId => {
                            const student = students.find(s => s.id === studentId);
                            if (!student) return null;
                            return (
                                <Avatar key={student.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                    <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} />
                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )
                        })}
                        {cls.studentIds.length > 5 && (
                            <Avatar className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background">
                                +{cls.studentIds.length - 5}
                            </Avatar>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                      <Badge variant="outline">{cls.studentIds.length} students</Badge>
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
                        <DropdownMenuItem>Manage Roster</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
