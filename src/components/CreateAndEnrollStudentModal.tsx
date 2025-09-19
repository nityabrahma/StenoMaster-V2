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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useAuth } from '@/hooks/use-auth';
import type { Class } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface CreateAndEnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToManage: Class;
}

export default function CreateAndEnrollStudentModal({
  isOpen,
  onClose,
  classToManage,
}: CreateAndEnrollStudentModalProps) {
  const { user: teacher, signup } = useAuth();
  const { toast } = useToast();
  const { fetchStudents } = useStudents();
  const { updateClass } = useClasses();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        description: 'You must be logged in as a teacher.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const { user: newStudentData } = await signup({
        name,
        email,
        password,
        role: 'student',
        teacherId: teacher.id as string,
      });

      await updateClass(classToManage.id, {
        students: [...classToManage.students, newStudentData.userId],
      });

      await fetchStudents();

      toast({
        title: 'Student Created and Enrolled!',
        description: `${name} has been added to ${classToManage.name}.`,
      });
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create & Enroll Student</DialogTitle>
            <DialogDescription>
              Create a new student account and automatically add them to "{classToManage.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="s-name" className="text-right">
                Full Name
              </Label>
              <Input
                id="s-name"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="s-email" className="text-right">
                Email
              </Label>
              <Input
                id="s-email"
                type="email"
                placeholder="e.g., j.doe@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="s-password" className="text-right">
                Password
              </Label>
              <Input
                id="s-password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create and Enroll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
