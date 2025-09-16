

import type { Types } from 'mongoose';

export type User = {
  id: string | Types.ObjectId;
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
  userInput: string; // The full text entered by the user
};

export type LoginCredentials = {
    email: string;
    password?: string; 
    role: 'student' | 'teacher';
}

export type CheckUserResponse = {
  exists: boolean;
  role?: 'student' | 'teacher';
  message?: string;
}

export type SignupCredentials = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}
