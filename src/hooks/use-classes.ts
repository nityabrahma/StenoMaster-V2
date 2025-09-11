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
}

export const useClasses = create<ClassesState>()(
  persist(
    (set, get) => ({
      classes: [],
      loadClasses: async () => {
        if (get().classes.length === 0) {
          set({ classes: initialClasses });
        }
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
      }
    }),
    {
      name: 'classes-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
