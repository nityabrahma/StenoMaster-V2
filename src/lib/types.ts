
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

export type LoginCredentials = {
    email: string;
    // For simplicity, we are not actually checking passwords.
    // In a real app, you would send this to the server for verification.
    password?: string; 
    role: 'student' | 'teacher';
}

export type SignupCredentials = {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher';
}
