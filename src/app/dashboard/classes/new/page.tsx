'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { students } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function NewClassPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [className, setClassName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
        toast({ title: "Error", description: "Class name is required.", variant: 'destructive' });
        return;
    }
    
    const newClass = {
        id: `class-${Date.now()}`,
        name: className,
        teacherId: user?.id,
        studentIds: selectedStudents,
    };

    console.log('Creating new class:', newClass);
    // In a real app, you would save this to your database
    // For now, we just log it and show a toast.
    
    toast({
        title: "Class Created!",
        description: `The class "${className}" has been successfully created.`,
    });

    const redirectPath = searchParams.get('redirect');
    if (redirectPath) {
        router.push(`${redirectPath}?newClassId=${newClass.id}`);
    } else {
        router.push('/dashboard/classes');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create New Class</CardTitle>
          <CardDescription>
            Fill in the details for your new class and assign students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input 
                    id="name" 
                    placeholder="e.g., Advanced Stenography" 
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Assign Students</Label>
                 <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4">
                        {students.map(student => (
                            <div key={student.id} className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id={`student-${student.id}`}
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={() => handleStudentSelect(student.id)}
                                />
                                <label
                                    htmlFor={`student-${student.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {student.name} ({student.email})
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
             <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit">Create Class</Button>
              </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
