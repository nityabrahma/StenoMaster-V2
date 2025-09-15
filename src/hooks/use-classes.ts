
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Class } from '@/lib/types';
import { classes as initialClasses } from '@/lib/data';

interface ClassesState {
  classes: Class[];
  loadClasses: () => Promise<void>;
  addClass: (newClass: Omit<Class, 'id'>) => Promise<Class>;
  updateClass: (updatedClass: Class) => Promise<void>;
  removeStudentFromAllClasses: (studentId: string) => void;
}

export const useClasses = create<ClassesState>()(
  persist(
    (set, get) => ({
      classes: [],
      loadClasses: async () => {
        // This function is now a no-op but is kept for potential future use,
        // for example, loading data from an API.
        // The persisted state will be loaded automatically by zustand middleware.
      },
      addClass: async (classData) => {
        const newClass: Class = {
            ...classData,
            id: `class-${Date.now()}`
        };
        set(state => ({ classes: [...state.classes, newClass] }));
        return newClass;
      },
      updateClass: async (updatedClass) => {
        set(state => ({
          classes: state.classes.map(c => c.id === updatedClass.id ? updatedClass : c)
        }));
      },
      removeStudentFromAllClasses: (studentId: string) => {
        set(state => ({
            classes: state.classes.map(c => ({
                ...c,
                studentIds: c.studentIds.filter(id => id !== studentId)
            }))
        }));
      }
    }),
    {
      name: 'classes-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
