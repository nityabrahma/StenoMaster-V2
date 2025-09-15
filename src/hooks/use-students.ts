
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Student } from '@/lib/types';

interface StudentsState {
  students: Student[];
  setStudents: (students: Student[]) => void;
  loadStudents: () => Promise<void>;
  addStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
  updateStudent: (updatedStudent: Student) => void;
}

export const useStudents = create<StudentsState>()(
  persist(
    (set) => ({
      students: [],
      setStudents: (students) => set({ students }),
      loadStudents: async () => {},
      addStudent: (student) => {
        set(state => ({ students: [...state.students, student] }));
      },
      removeStudent: (studentId) => {
        set(state => ({
          students: state.students.filter(s => s.id !== studentId)
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
