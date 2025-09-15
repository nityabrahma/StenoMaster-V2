
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Student } from '@/lib/types';

interface StudentsState {
  students: Student[];
  loadStudents: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'classIds'>) => Promise<Student>;
  removeStudent: (studentId: string) => void;
  updateStudent: (updatedStudent: Student) => void;
}

export const useStudents = create<StudentsState>()(
  persist(
    (set) => ({
      students: [],
      loadStudents: async () => {},
      addStudent: async (studentData) => {
        const newStudent: Student = {
          ...studentData,
          id: `student-${Date.now()}`,
          classIds: []
        };
        set(state => ({ students: [...state.students, newStudent] }));
        return newStudent;
      },
      removeStudent: (studentId) => {
        set(state => ({
          students: state.students.filter(s => s.id !== studentId)
          // Note: Also need to remove student from classes and their submissions
          // This part would be handled server-side in a real app.
          // For now, we'll just remove the student object.
        }));
      },
      updateStudent: (updatedStudent) => {
        set(state => ({
          students: state.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
        }));
      }
    }),
    {
      name: 'students-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
