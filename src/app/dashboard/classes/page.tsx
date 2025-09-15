
'use client';
import { useAuth } from '@/hooks/use-auth';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import type { Class } from '@/lib/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import CreateClassModal from '@/components/CreateClassModal';
import EditClassModal from '@/components/EditClassModal';
import ManageStudentsModal from '@/components/ManageStudentsModal';

export default function ClassesPage() {
  const { user } = useAuth();
  const { classes } = useClasses();
  const { students } = useStudents();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [managingStudentsClass, setManagingStudentsClass] = useState<Class | null>(null);

  if (!user || user.role !== 'teacher') return <p>Access Denied</p>;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);

  return (
    <>
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {editingClass && (
        <EditClassModal
          isOpen={!!editingClass}
          onClose={() => setEditingClass(null)}
          classToEdit={editingClass}
        />
      )}
      {managingStudentsClass && (
        <ManageStudentsModal
          isOpen={!!managingStudentsClass}
          onClose={() => setManagingStudentsClass(null)}
          classToManage={managingStudentsClass}
        />
      )}
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-2xl">Your Classes</CardTitle>
                <CardDescription>View and manage students for each class.</CardDescription>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
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
                              const nameParts = student.name.split(' ');
                              const studentInitials = nameParts.length > 1
                                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                                : student.name.substring(0, 2);
                              return (
                                  <Avatar key={student.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                      <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} />
                                      <AvatarFallback>{studentInitials}</AvatarFallback>
                                  </Avatar>
                              )
                          })}
                          {cls.studentIds.length > 5 && (
                              <Avatar className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background">
                                  <AvatarFallback>+{cls.studentIds.length - 5}</AvatarFallback>
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
                          <DropdownMenuItem onClick={() => setEditingClass(cls)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setManagingStudentsClass(cls)}>Manage Students</DropdownMenuItem>
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
    </>
  );
}
