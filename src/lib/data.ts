import type { Teacher, Student, Class, Assignment, Submission } from './types';

export const teachers: Teacher[] = [
  { id: 'teacher-1', name: 'Dr. Evelyn Reed', email: 'e.reed@school.edu', role: 'teacher' },
];

export const students: Student[] = [
  { id: 'student-1', name: 'Alice Johnson', email: 'a.johnson@school.edu', role: 'student', classIds: ['class-1'] },
  { id: 'student-2', name: 'Bob Williams', email: 'b.williams@school.edu', role: 'student', classIds: ['class-1', 'class-2'] },
  { id: 'student-3', name: 'Charlie Brown', email: 'c.brown@school.edu', role: 'student', classIds: ['class-2'] },
  { id: 'student-4', name: 'Diana Miller', email: 'd.miller@school.edu', role: 'student', classIds: [] },
];

export const classes: Class[] = [
  { id: 'class-1', name: 'Introduction to Stenography', teacherId: 'teacher-1', studentIds: ['student-1', 'student-2'] },
  { id: 'class-2', name: 'Advanced Typing Techniques', teacherId: 'teacher-1', studentIds: ['student-2', 'student-3'] },
];

export const assignments: Assignment[] = [
  {
    id: 'assignment-1',
    title: 'The Great Gatsby - Chapter 1',
    classId: 'class-1',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    text: 'In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since. "Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven’t had the advantages that you’ve had."',
    imageUrl: 'https://picsum.photos/seed/book1/600/400'
  },
  {
    id: 'assignment-2',
    title: 'Business Correspondence Practice',
    classId: 'class-2',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    text: 'Dear Mr. Smith, Thank you for your inquiry regarding our services. We are pleased to provide you with the information you requested. Our team is dedicated to offering the highest quality support.',
    imageUrl: 'https://picsum.photos/seed/office1/600/400'
  },
    {
    id: 'assignment-3',
    title: 'Historical Document Transcription',
    classId: 'class-1',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Past due
    text: 'When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature\'s God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.',
    imageUrl: 'https://picsum.photos/seed/manuscript/600/400'
  }
];

export const submissions: Submission[] = [
    {
        id: 'sub-1',
        assignmentId: 'assignment-3',
        studentId: 'student-1',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        wpm: 52,
        accuracy: 95.2,
        mistakes: 5
    },
    {
        id: 'sub-2',
        assignmentId: 'assignment-3',
        studentId: 'student-2',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        wpm: 68,
        accuracy: 98.1,
        mistakes: 2
    }
];
