
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
import { useStudents } from '@/hooks/use-students';
import { useAuth } from '@/hooks/use-auth';
import type { Student } from '@/lib/types';
import { Label } from './ui/label';

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onAssignSuccess: () => void;
}

export default function AssignStudentModal({
  isOpen,
  onClose,
  student,
  onAssignSuccess,
}: AssignStudentModalProps) {
  const { user } = useAuth();
  const { classes, updateClass } = useClasses();
  const { updateStudent } = useStudents();
  const [selectedClassId, setSelectedClassId] = useState('');

  if (!user || user.role !== 'teacher') return null;

  const teacherClasses = classes.filter(c => c.teacherId === user.id);
  const availableClasses = teacherClasses.filter(c => !c.studentIds.includes(student.id));

  const handleAssign = async () => {
    if (!selectedClassId) return;

    const classToUpdate = classes.find(c => c.id === selectedClassId);
    if (!classToUpdate) return;
    
    // Add student to the new class
    await updateClass(classToUpdate.id, {
        studentIds: [...classToUpdate.studentIds, student.id]
    });

    // Update the student's classIds array
    await updateStudent(student.id, {
        classIds: [...student.classIds, selectedClassId]
    });

    onAssignSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign {student.name} to a Class</DialogTitle>
          <DialogDescription>
            Select a class to enroll this student in.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
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
                        <p className="p-2 text-sm text-muted-foreground">No available classes.</p>
                    )}
                </SelectContent>
            </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedClassId}>Assign Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
