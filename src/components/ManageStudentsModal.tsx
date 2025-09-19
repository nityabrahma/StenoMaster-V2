'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import type { Class, Student } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Search, UserPlus, Users, X, ArrowRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import AssignStudentModal from './AssignStudentModal';
import CreateAndEnrollStudentModal from './CreateAndEnrollStudentModal';
import AddExistingStudentModal from './AddExistingStudentModal';

interface ManageStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToManage: Class;
}

export default function ManageStudentsModal({
  isOpen,
  onClose,
  classToManage,
}: ManageStudentsModalProps) {
  const { toast } = useToast();
  const { students } = useStudents();
  const { updateClass } = useClasses();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState<Student | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const enrolledStudents = useMemo(() => {
    return students
      .filter((s) => classToManage.students.includes(s.id as string))
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, classToManage, searchTerm]);

  const handleRemoveStudent = async (studentId: string) => {
    setIsSubmitting(true);
    try {
      const updatedStudentIds = classToManage.students.filter((id) => id !== studentId);
      await updateClass(classToManage.id, { students: updatedStudentIds });
      toast({
        title: 'Student Removed',
        description: 'The student has been un-enrolled from this class.',
      });
    } catch (error: any) {
      toast({
        title: 'Removal Failed',
        description: error.message || 'Could not remove the student.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Manage Students in {classToManage.name}</DialogTitle>
            <DialogDescription>
              Add, remove, or transfer students in this class.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enrolled students..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
              <Users className="mr-2 h-4 w-4" /> Add Existing
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Create New
            </Button>
          </div>

          <ScrollArea className="h-80 mt-4 pr-4">
            {enrolledStudents.length > 0 ? (
              <div className="space-y-2">
                {enrolledStudents.map((student) => {
                  const nameParts = student.name.split(' ');
                  const initials = nameParts.length > 1
                    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                    : student.name.substring(0, 2);

                  return (
                    <div
                      key={student.id as string}
                      className="flex items-center p-2 rounded-md transition-colors"
                    >
                      <Avatar className="h-9 w-9 relative">
                        <p className='absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center text-xs bg-slate-800/50'>{initials}</p>
                        <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} alt={student.name} />
                      </Avatar>
                      <div className="ml-3 flex-grow">
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStudentToTransfer(student)}
                        disabled={isSubmitting}
                      >
                        <ArrowRight className="mr-1 h-4 w-4" /> Transfer
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveStudent(student.id as string)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="mr-1 h-4 w-4" />
                        )}
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No students enrolled in this class.</p>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {studentToTransfer && (
        <AssignStudentModal
          isOpen={!!studentToTransfer}
          onClose={() => setStudentToTransfer(null)}
          student={studentToTransfer}
          onAssignSuccess={(studentName, newClassName) => {
            toast({
              title: 'Student Transferred!',
              description: `${studentName} has been enrolled in ${newClassName}.`,
            });
            setStudentToTransfer(null);
          }}
        />
      )}

      {isCreateModalOpen && (
        <CreateAndEnrollStudentModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            classToManage={classToManage}
        />
      )}

      {isAddModalOpen && (
        <AddExistingStudentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            classToManage={classToManage}
        />
      )}
    </>
  );
}
