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
import { Button } from '@/components/ui/button';
import { Pencil, Users, PlusCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import CreateClassModal from '@/components/CreateClassModal';
import EditClassModal from '@/components/EditClassModal';
import ManageStudentsModal from '@/components/ManageStudentsModal';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <div className="container mx-auto p-4 md:p-8 h-full flex flex-col gap-4">
        <Card className="flex-shrink-0">
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
        </Card>
        <Card className="flex-1 min-h-0">
            <CardContent className="h-full p-6 flex flex-col">
                <div className="grid grid-cols-[3fr_2fr_1fr] gap-4 px-4 pb-2 border-b font-semibold text-muted-foreground">
                    <div>Class Name</div>
                    <div className="text-center">Students</div>
                    <div className="text-center">Actions</div>
                </div>
                {teacherClasses.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                        You haven't created any classes yet.
                    </div>
                ) : (
                <ScrollArea className="h-full">
                    <TooltipProvider>
                        <div className="divide-y divide-border">
                            {teacherClasses.map(cls => (
                            <div key={cls.id} className="grid grid-cols-[3fr_2fr_1fr] gap-4 px-4 py-3 items-center">
                                <div className="font-medium truncate">{cls.name}</div>
                                <div className="min-w-0 flex items-center justify-center gap-2">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {cls.students.slice(0, 5).map(studentId => {
                                            const student = students.find(s => s.id === studentId);
                                            if (!student) return null;
                                            const nameParts = student.name.split(' ');
                                            const studentInitials = nameParts.length > 1
                                                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                                                : student.name.substring(0, 2);
                                            return (
                                                <Avatar key={student.id.toString()} className="inline-block h-8 w-8 rounded-full ring-2 ring-background relative">
                                                    <p className='absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center text-sm bg-slate-800/50'>{studentInitials}</p>
                                                    <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} />
                                                </Avatar>
                                            )
                                        })}
                                        {cls.students.length > 5 && (
                                            <Avatar className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background">
                                                <AvatarFallback>+{cls.students.length - 5}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                    {cls.students.length > 0 ? (
                                        <Badge variant="outline">{cls.students.length} student{cls.students.length > 1 ? 's' : ''}</Badge>
                                    ) : (
                                       <span className="text-xs text-muted-foreground self-center">No students</span>
                                    )}
                                </div>
                                <div className="flex justify-center items-center gap-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingClass(cls)}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit Class</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Edit Class</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setManagingStudentsClass(cls)}>
                                                <Users className="h-4 w-4" />
                                                <span className="sr-only">Manage Students</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Manage Students</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                            ))}
                        </div>
                    </TooltipProvider>
                </ScrollArea>
                )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
