
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClasses } from '@/hooks/use-classes';
import { useAuth } from '@/hooks/use-auth';
import type { Student } from '@/lib/types';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onAssignSuccess: (studentName: string, newClassName: string) => void;
}

export default function AssignStudentModal({
  isOpen,
  onClose,
  student,
  onAssignSuccess,
}: AssignStudentModalProps) {
  const { user } = useAuth();
  const { classes, updateClass } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== 'teacher') return null;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);
  const currentClass = teacherClasses.find(c => c.students.includes(student.id as string));

  // Filter out the class the student is already in
  const availableClasses = teacherClasses.filter(c => c.id !== currentClass?.id);

  const handleAssign = async () => {
    if (!selectedClassId) return;

    setIsSubmitting(true);

    try {
        const newClass = classes.find(c => c.id === selectedClassId);
        if (!newClass) throw new Error("Selected class not found.");

        const updatePromises = [];

        // 1. Remove student from their current class, if they have one.
        if (currentClass) {
            const updatedStudentIds = currentClass.students.filter(id => id !== student.id);
            updatePromises.push(updateClass(currentClass.id, { students: updatedStudentIds }));
        }
        
        // 2. Add student to the new class.
        updatePromises.push(updateClass(newClass.id, {
            students: [...newClass.students, student.id as string]
        }));
        
        await Promise.all(updatePromises);

        onAssignSuccess(student.name, newClass.name);
        onClose();
    } catch (error: any) {
        console.error("Failed to transfer student:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign {student.name} to a Class</DialogTitle>
          <DialogDescription>
            {currentClass ? 'Select a new class to transfer this student.' : 'Select a class to enroll this student.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            {currentClass && (
                <p className="text-sm text-muted-foreground">
                    Currently in: <span className="font-semibold text-foreground">{currentClass.name}</span>
                </p>
            )}
            <Label htmlFor="class-select">Available Classes</Label>
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                <SelectTrigger id="class-select">
                    <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                    {availableClasses.length > 0 ? availableClasses.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                            {c.name}
                        </SelectItem>
                    )) : (
                        <p className="p-2 text-sm text-muted-foreground">No other classes available for transfer.</p>
                    )}
                </SelectContent>
            </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedClassId || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentClass ? 'Transfer Student' : 'Assign Student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
