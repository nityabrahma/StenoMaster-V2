
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useClasses } from '@/hooks/use-classes';
import { useAssignments } from '@/hooks/use-assignments';
import { useAppRouter } from '@/hooks/use-app-router';
import CreateClassModal from '@/components/CreateClassModal';

const assignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  classId: z.string().min(1, 'Please select a class.'),
  deadline: z.date({
    required_error: 'A due date is required.',
  }),
  text: z.string().min(20, 'Assignment text must be at least 20 characters.'),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function NewAssignmentPageContent() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { classes } = useClasses();
  const { createAssignment } = useAssignments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const teacherClasses = classes.filter((c) => c.teacherId === user?.id);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      classId: '',
      text: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    const newClassId = searchParams.get('newClassId');
    if (newClassId) {
      form.setValue('classId', newClassId);
    }
  }, [searchParams, form]);

  const onSubmit = async (data: AssignmentFormValues) => {
    try {
        await createAssignment({
            ...data,
            deadline: data.deadline.toISOString(),
        });
        toast({
            title: "Assignment Created!",
            description: `The assignment "${data.title}" has been successfully created.`,
        });
        router.push('/dashboard/assignments');
    } catch (error: any) {
        toast({
            title: "Creation Failed",
            description: error.message || "Could not create the assignment.",
            variant: 'destructive',
        });
    }
  };

  const handleClassChange = (value: string) => {
    if (value === 'create-new') {
        setIsModalOpen(true);
    } else {
        form.setValue('classId', value);
    }
  }

  const handleClassCreated = (newClass: { id: string }) => {
    form.setValue('classId', newClass.id);
  };

  return (
    <>
      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassCreated={handleClassCreated}
      />
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              Create New Assignment
            </CardTitle>
            <CardDescription>
              Fill out the form below to create a new typing assignment for your
              students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., The Great Gatsby - Chapter 1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={handleClassChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teacherClasses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="create-new">
                              <div className='flex items-center'>
                                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Class
                              </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-[240px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste or type the full text for the assignment here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is the text your students will be timed on.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optional Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://picsum.photos/seed/1/600/400"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add an image to give context to the assignment.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit">Create Assignment</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
