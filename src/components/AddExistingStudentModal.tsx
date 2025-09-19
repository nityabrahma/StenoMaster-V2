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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import type { Class } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Search } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface AddExistingStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToManage: Class;
}

export default function AddExistingStudentModal({
  isOpen,
  onClose,
  classToManage,
}: AddExistingStudentModalProps) {
  const { toast } = useToast();
  const { students } = useStudents();
  const { classes, updateClass } = useClasses();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableStudents = useMemo(() => {
    const allEnrolledStudentIds = new Set(classes.flatMap((c) => c.students));
    return students
      .filter((s) => !allEnrolledStudentIds.has(s.id as string))
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, classes, searchTerm]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleAddExisting = async () => {
    if (selectedStudents.length === 0) {
      toast({ title: 'No students selected.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateClass(classToManage.id, {
        students: [...classToManage.students, ...selectedStudents],
      });

      toast({
        title: 'Students Enrolled!',
        description: `${selectedStudents.length} student(s) added to ${classToManage.name}.`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Could not enroll students.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Existing Students</DialogTitle>
          <DialogDescription>
            Select un-enrolled students to add to "{classToManage.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search available students..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-60 mt-4 border rounded-md">
          <div className="p-4 space-y-2">
            {availableStudents.length > 0 ? (
              availableStudents.map((student) => (
                <div key={student.id as string} className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted">
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudents.includes(student.id as string)}
                    onCheckedChange={() => handleStudentSelect(student.id as string)}
                  />
                  <label
                    htmlFor={`student-${student.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow"
                  >
                    {student.name} <span className="text-muted-foreground">({student.email})</span>
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-8">
                No un-enrolled students found.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddExisting}
            disabled={selectedStudents.length === 0 || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Selected ({selectedStudents.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
