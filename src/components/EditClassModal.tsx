'use client';

import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit: Class;
}

export default function EditClassModal({
  isOpen,
  onClose,
  classToEdit,
}: EditClassModalProps) {
  const { toast } = useToast();
  const { updateClass } = useClasses();
  const [className, setClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (classToEdit) {
      setClassName(classToEdit.name);
    }
  }, [classToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      toast({
        title: 'Error',
        description: 'Class name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
        await updateClass(classToEdit.id, { name: className });
        toast({
        title: 'Class Updated!',
        description: `The class has been renamed to "${className}".`,
        });
        onClose();
    } catch(error: any) {
        toast({
            title: 'Update Failed',
            description: error.message || 'Could not update class name.',
            variant: 'destructive'
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Class Name</DialogTitle>
            <DialogDescription>
              Enter a new name for the class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Class Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
