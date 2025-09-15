
'use_client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Class } from '@/lib/types';

interface ClassesState {
  classes: Class[];
  setClasses: (classes: Class[]) => void;
  loadClasses: () => Promise<void>;
  addClass: (newClass: Class) => void;
  updateClass: (updatedClass: Class) => void;
  removeStudentFromAllClasses: (studentId: string) => void;
}

export const useClasses = create<ClassesState>()(
  persist(
    (set) => ({
      classes: [],
      setClasses: (classes) => set({ classes }),
      loadClasses: async () => {},
      addClass: (newClass) => {
        set(state => ({ classes: [...state.classes, newClass] }));
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
