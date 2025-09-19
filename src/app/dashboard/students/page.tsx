

'use client';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
import { MoreHorizontal, PlusCircle, Trash2, Loader2, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStudents } from '@/hooks/use-students';
import { useClasses } from '@/hooks/use-classes';
import { useAppRouter } from '@/hooks/use-app-router';
import AssignStudentModal from '@/components/AssignStudentModal';
import type { Student } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

function CreateStudentDialog() {
    const { user: teacher, signup } = useAuth();
    const { toast } = useToast();
    const { fetchStudents } = useStudents();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

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

        if (!teacher) {
            toast({
                title: 'Error',
                description: 'You must be logged in to create a student.',
                variant: 'destructive',
            });
            return;
        }

        setIsCreating(true);
        try {
            await signup({ name, email, password, role: 'student', teacherId: teacher.id as string });
            await fetchStudents(); // Re-fetch students list
            toast({
                title: 'Success',
                description: `Student account for ${name} created.`,
            });
            setName('');
            setEmail('');
            setPassword('');
            setIsOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                Enter the student's details to create a new account. They will be associated with you.
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
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

export default function StudentsPage() {
  const { user } = useAuth();
  const { students, removeStudent } = useStudents();
  const { classes } = useClasses();
  const router = useAppRouter();
  const { toast } = useToast();
  const [studentToAssign, setStudentToAssign] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!user || user.role !== 'teacher') return <p>Access Denied</p>;

  const teacherStudents = students.filter(s => {
    if (s.teacherId !== user.id) return false;
    if (searchTerm === '') return true;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(lowerCaseSearch) || s.email.toLowerCase().includes(lowerCaseSearch);
  });

  const handleDeleteStudent = async (studentId: string) => {
    try {
        await removeStudent(studentId);
        toast({
        title: 'Student Removed',
        description: 'The student account has been deleted.',
        });
    } catch(error: any) {
        toast({
            title: 'Deletion Failed',
            description: error.message || 'Could not remove student.',
            variant: 'destructive',
        });
    }
  };

  const handleAssignSuccess = () => {
    toast({
        title: 'Student Assigned!',
        description: 'The student has been enrolled in the selected class.',
    });
  }

  return (
    <>
    {studentToAssign && (
        <AssignStudentModal
            isOpen={!!studentToAssign}
            onClose={() => setStudentToAssign(null)}
            student={studentToAssign}
            onAssignSuccess={handleAssignSuccess}
        />
    )}
    <div className="container mx-auto p-4 md:p-8 h-full flex flex-col gap-4">
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl">All Students</CardTitle>
              <CardDescription>View and manage all students assigned to you.</CardDescription>
            </div>
            <CreateStudentDialog />
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name or email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>
      <Card className="flex-1 min-h-0">
        <CardContent className="h-full p-6 flex flex-col">
            <div className="grid grid-cols-[2fr_2fr_auto] gap-4 px-4 pb-2 border-b font-semibold text-muted-foreground">
                <div className="text-center">Student</div>
                <div className="text-center">Classes</div>
                <div className="w-8"><span className="sr-only">Actions</span></div>
            </div>
            {teacherStudents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    {searchTerm ? 'No students match your search.' : 'No students have been created yet.'}
                </div>
            ) : (
            <ScrollArea className="h-full">
                <div className="divide-y divide-border">
                {teacherStudents.map(student => {
                    const studentClasses = classes.filter(c => student.classIds.includes(c.id));
                    const nameParts = student.name.split(' ');
                    const studentInitials = nameParts.length > 1
                        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                        : student.name.substring(0, 2);

                    return (
                    <div key={student.id.toString()} className="grid grid-cols-[2fr_2fr_auto] gap-4 px-4 py-3 items-center">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} />
                                <AvatarFallback>{studentInitials}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                <p className="font-medium truncate">{student.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="min-w-0 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                                {studentClasses.map(c => <Badge key={c.id} variant="secondary" className="truncate">{c.name}</Badge>)}
                                {studentClasses.length === 0 && <span className="text-xs text-muted-foreground">Not enrolled</span>}
                            </div>
                        </div>
                        <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}/performance`)}>
                                View Performance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStudentToAssign(student)}>
                                Assign to Class
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Student
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the student's
                                        account and remove all their data.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => handleDeleteStudent(student.id as string)}
                                    >
                                        Yes, delete student
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    </div>
                    );
                })}
                </div>
            </ScrollArea>
            )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
