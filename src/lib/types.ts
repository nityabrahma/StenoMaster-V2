

import type { Types } from 'mongoose';

export type User = {
  id: string | Types.ObjectId;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  teacherId?: string; // Add teacherId to the base user
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
  createdAt: string; // ISO Date string
};

export type Assignment = {
  id: string;
  title: string;
  classId: string;
  deadline: string; // ISO date string
  text: string;
  imageUrl?: string;
};

export interface Mistake {
  expected: string;
  actual: string;
  position: number;
}

export interface Score {
  id: string;
  studentId: string;
  assignmentId: string;
  userInput: string;
  accuracy: number;
  wpm: number;
  timeElapsed: number;
  completedAt: string; // ISO Date string
  mistakes: Mistake[];
}


export type LoginCredentials = {
    email: string;
    password?: string; 
    role: 'student' | 'teacher';
}

export type CheckUserResponse = {
  exists: boolean;
  role?: 'student' | 'teacher';
  name?: string;
  message?: string;
}

export type SignupCredentials = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  teacherId?: string; // Optional teacherId for student signup
}
