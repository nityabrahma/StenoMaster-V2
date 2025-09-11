'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Student } from '@/lib/types';
import { students as initialStudents } from '@/lib/data';

interface StudentsState {
  students: Student[];
  loadStudents: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'classIds'>) => Promise<Student>;
}

export const useStudents = create<StudentsState>()(
  persist(
    (set, get) => ({
      students: [],
      loadStudents: async () => {
        if (get().students.length === 0) {
          set({ students: initialStudents });
        }
      },
      addStudent: async (studentData) => {
        const newStudent: Student = {
          ...studentData,
          id: `student-${Date.now()}`,
          classIds: []
        };
        set(state => ({ students: [...state.students, newStudent] }));
        return newStudent;
      }
    }),
    {
      name: 'students-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
