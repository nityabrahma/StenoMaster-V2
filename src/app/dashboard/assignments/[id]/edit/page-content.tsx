
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
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
import { CalendarIcon, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';
import { useClasses } from '@/hooks/use-classes';
import { useDataStore } from '@/hooks/use-data-store';
import { useAppRouter } from '@/hooks/use-app-router';
import Image from 'next/image';
import type { Assignment } from '@/lib/types';

const assignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  classId: z.string().min(1, 'Please select a class.'),
  deadline: z.date({
    required_error: 'A due date is required.',
  }),
  text: z.string().min(20, 'Assignment text must be at least 20 characters.'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface EditAssignmentPageContentProps {
  assignment: Assignment;
}

export default function EditAssignmentPageContent({ assignment }: EditAssignmentPageContentProps) {
  const router = useAppRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { classes } = useClasses();
  const { updateAssignment } = useDataStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teacherClasses = classes.filter((c) => c.teacherId === user?.id);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: assignment.title,
      classId: assignment.classId,
      deadline: new Date(assignment.deadline),
      text: assignment.text,
      imageUrl: assignment.imageUrl || '',
    },
  });
  
  const imageUrlValue = form.watch('imageUrl');
  const textValue = form.watch('text');
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);
    
    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error.message || 'Upload failed');
        }

        const imageData = await res.json();
        form.setValue('imageUrl', imageData.secure_url);
        toast({
            title: 'Image Uploaded',
            description: 'The image has been successfully added.',
        });
    } catch (error: any) {
        toast({
            title: 'Upload Failed',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmit = async (data: AssignmentFormValues) => {
    setIsSubmitting(true);
    try {
        const deadlineDate = new Date(data.deadline);
        deadlineDate.setHours(23, 59, 59, 999);
        await updateAssignment(assignment.id, {
            ...data,
            deadline: deadlineDate.toISOString(),
        });
        toast({
            title: "Assignment Updated!",
            description: `The assignment "${data.title}" has been successfully updated.`,
        });
        router.push('/dashboard/assignments');
    } catch (error: any) {
        toast({
            title: "Update Failed",
            description: error.message || "Could not update the assignment.",
            variant: 'destructive',
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              Edit Assignment
            </CardTitle>
            <CardDescription>
              Update the details for this typing assignment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
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
                                <Select onValueChange={field.onChange} value={field.value}>
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
                                            'w-full justify-start text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? (
                                            format(field.value, 'PPP')
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
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
                    </div>
                    
                    <div className="space-y-2">
                        <FormLabel>Optional Image</FormLabel>
                        <FormDescription>
                            Add an image to give context to the assignment.
                        </FormDescription>
                        <Card className="aspect-video w-full flex items-center justify-center relative overflow-hidden mt-2 border-dashed">
                             {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                             ) : imageUrlValue ? (
                                <>
                                    <Image src={imageUrlValue} alt="Assignment image preview" fill style={{objectFit: "cover"}} />
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute top-2 right-2 z-10 h-7 w-7"
                                        onClick={() => form.setValue('imageUrl', '')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                             ) : (
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="mx-auto h-12 w-12" />
                                    <p className="mt-2 text-sm">No image uploaded.</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Upload Image
                                    </Button>
                                </div>
                             )}
                        </Card>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                            disabled={isUploading}
                        />
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input
                                        type="hidden"
                                        {...field}
                                        />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                </div>

                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Assignment Text</FormLabel>
                        <span className="text-xs text-muted-foreground">
                            {textValue.length} characters
                        </span>
                      </div>
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

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
