
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
import type { Class } from '@/lib/types';
import { Loader2 } from 'lucide-react';

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
  const { toast } = useToast();
  const { createClass } = useClasses();
  const [className, setClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      toast({
        title: 'Error',
        description: 'Class name is required.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        const newClass = await createClass({
            name: className,
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
    } catch (error: any) {
        toast({
            title: 'Creation Failed',
            description: error.message || 'Could not create class.',
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
