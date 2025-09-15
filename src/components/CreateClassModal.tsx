
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
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
import type { Class } from '@/lib/types';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated?: (newClass: Class) => void;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onClassCreated,
}: CreateClassModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addClass } = useClasses();
  const [className, setClassName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !user) {
      toast({
        title: 'Error',
        description: 'Class name is required.',
        variant: 'destructive',
      });
      return;
    }

    const newClass = await addClass({
      name: className,
      teacherId: user.id,
      studentIds: [],
    });

    toast({
      title: 'Class Created!',
      description: `The class "${className}" has been successfully created.`,
    });

    if (onClassCreated) {
      onClassCreated(newClass);
    }
    
    setClassName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Enter a name for your new class. You can add students later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Class Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Advanced Stenography"
                className="col-span-3"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Class</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
