export type User = {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
};

export type Student = User & {
  role: 'student';
  classIds: string[];
};

export type Teacher = User & {
  role: 'teacher';
};

export type Class = {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
};

export type Assignment = {
  id: string;
  title: string;
  classId: string;
  deadline: string; // ISO date string
  text: string;
  imageUrl?: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string; // ISO date string
  wpm: number;
  accuracy: number;
  mistakes: number;
};
