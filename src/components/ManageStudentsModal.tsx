
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useAuth } from '@/hooks/use-auth';
import type { Class, Student } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from './ui/scroll-area';

interface ManageStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToManage: Class;
}

function CreateAndEnrollStudent({ classToManage, onStudentCreated }: { classToManage: Class, onStudentCreated: (student: Student) => void }) {
    const { signup } = useAuth();
    const { toast } = useToast();
    const { fetchStudents } = useStudents();
    const { updateClass } = useClasses();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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

        try {
            const newStudent = await signup({ name, email, password, role: 'student' });
            
            await updateClass(classToManage.id, {
                studentIds: [...classToManage.studentIds, newStudent.id],
            });

            await fetchStudents();
            
            toast({
                title: 'Student Created and Enrolled!',
                description: `${name} has been added to ${classToManage.name}.`,
            });
            setName('');
            setEmail('');
            setPassword('');
            onStudentCreated(newStudent);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="s-name">Full Name</Label>
                <Input id="s-name" placeholder="e.g., John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" type="email" placeholder="e.g., j.doe@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="s-password">Password</Label>
                <Input id="s-password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Create and Enroll Student</Button>
        </form>
    );
}

export default function ManageStudentsModal({
  isOpen,
  onClose,
  classToManage,
}: ManageStudentsModalProps) {
    const { toast } = useToast();
    const { students } = useStudents();
    const { classes, updateClass } = useClasses();
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    
    // Find students who are not in any class yet
    const allEnrolledStudentIds = classes.flatMap(c => c.studentIds);
    const availableStudents = students.filter(s => !allEnrolledStudentIds.includes(s.id));
    
    const handleStudentSelect = (studentId: string) => {
        setSelectedStudents(prev => 
        prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const handleAddExisting = async () => {
        if (selectedStudents.length === 0) {
            toast({ title: "No students selected.", variant: "destructive" });
            return;
        }

        try {
            await updateClass(classToManage.id, {
                studentIds: [...classToManage.studentIds, ...selectedStudents],
            });
            
            toast({
                title: "Students Enrolled!",
                description: `${selectedStudents.length} student(s) added to ${classToManage.name}.`,
            });
            setSelectedStudents([]);
            onClose();
        } catch(error: any) {
            toast({
                title: 'Enrollment Failed',
                description: error.message || 'Could not enroll students.',
                variant: 'destructive',
            });
        }
    };
    
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Students for {classToManage.name}</DialogTitle>
          <DialogDescription>
            Add existing students or create new ones to enroll in this class.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="add-existing">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add-existing">Add Existing</TabsTrigger>
                <TabsTrigger value="create-new">Create New</TabsTrigger>
            </TabsList>
            <TabsContent value="add-existing">
                <ScrollArea className="h-60 mt-4">
                    <div className="space-y-2 pr-4">
                        {availableStudents.length > 0 ? availableStudents.map(student => (
                            <div key={student.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`student-${student.id}`}
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={() => handleStudentSelect(student.id)}
                                />
                                <label
                                    htmlFor={`student-${student.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {student.name} ({student.id})
                                </label>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center pt-8">No un-enrolled students available.</p>
                        )}
                    </div>
                </ScrollArea>
                <Button onClick={handleAddExisting} className="w-full mt-4" disabled={selectedStudents.length === 0}>Add Selected Students</Button>
            </TabsContent>
            <TabsContent value="create-new">
                <CreateAndEnrollStudent 
                    classToManage={classToManage} 
                    onStudentCreated={() => onClose()}
                />
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
