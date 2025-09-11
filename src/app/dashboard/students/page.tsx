
'use client';
import { useAuth } from '@/hooks/use-auth';
import { classes, students as mockStudents, submissions } from '@/lib/data';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function CreateStudentDialog() {
    const { signup } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast({
                title: 'Error',
                description: 'Please fill out all fields.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await signup({ name, email, password, role: 'student' });
            toast({
                title: 'Success',
                description: `Student account for ${name} created.`,
            });
            // TODO: close dialog and refresh student list
            setName('');
            setEmail('');
            setPassword('');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Student
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Create Student Account</DialogTitle>
                <DialogDescription>
                Enter the student's details to create a new account.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    Full Name
                </Label>
                <Input id="name" placeholder="e.g., John Doe" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                    Email
                </Label>
                <Input id="email" type="email" placeholder="e.g., j.doe@school.edu" className="col-span-3" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                    Password
                </Label>
                <Input id="password" type="password" placeholder="Min. 6 characters" className="col-span-3" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

export default function StudentsPage() {
  const { user } = useAuth();
  // For now, we continue to use mockStudents for display until the auth state manages all users
  const [students, setStudents] = useState(mockStudents);

  if (!user || user.role !== 'teacher') return <p>Access Denied</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl">Student Roster</CardTitle>
              <CardDescription>View and manage all students in the system.</CardDescription>
            </div>
            <CreateStudentDialog />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Avg. WPM</TableHead>
                <TableHead>Avg. Accuracy</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => {
                const studentSubmissions = submissions.filter(s => s.studentId === student.id);
                const avgWpm = studentSubmissions.length > 0 ? Math.round(studentSubmissions.reduce((acc, s) => acc + s.wpm, 0) / studentSubmissions.length) : 'N/A';
                const avgAccuracy = studentSubmissions.length > 0 ? (studentSubmissions.reduce((acc, s) => acc + s.accuracy, 0) / studentSubmissions.length).toFixed(1) + '%' : 'N/A';
                const studentClasses = classes.filter(c => student.classIds.includes(c.id));
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} />
                          <AvatarFallback>{student.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1">
                            {studentClasses.map(c => <Badge key={c.id} variant="secondary">{c.name}</Badge>)}
                            {studentClasses.length === 0 && <span className="text-xs text-muted-foreground">Not enrolled</span>}
                        </div>
                    </TableCell>
                    <TableCell>{avgWpm}</TableCell>
                    <TableCell>{avgAccuracy}</TableCell>
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
                          <DropdownMenuItem>View Performance</DropdownMenuItem>
                          <DropdownMenuItem>Edit Student</DropdownMenuItem>
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
    </div>
  );
}
