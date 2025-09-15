
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth-provider';
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
import { useStudents } from '@/hooks/use-students';
import { useClasses } from '@/hooks/use-classes';
import { useAppRouter } from '@/hooks/use-app-router';


export default function NewClassPage() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { students } = useStudents();
  const { createClass } = useClasses();
  
  const [className, setClassName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !user) {
        toast({ title: "Error", description: "Class name is required.", variant: 'destructive' });
        return;
    }
    
    try {
        const newClass = await createClass({
            name: className,
            studentIds: selectedStudents,
        });
        
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
    } catch (error: any) {
        toast({
            title: "Creation Failed",
            description: error.message || "Could not create class.",
            variant: "destructive"
        })
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
                                    {student.name} ({student.id})
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
