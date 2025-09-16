
'use client';
import { create } from 'zustand';
import type { Class } from '@/lib/types';

type NewClass = Omit<Class, 'id' | 'teacherId'>;

interface ClassesState {
  classes: Class[];
  fetchClasses: () => Promise<void>;
  createClass: (newClassData: NewClass) => Promise<Class>;
  updateClass: (classId: string, updatedData: Partial<Class>) => Promise<void>;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `API Error: ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}


export const useClasses = create<ClassesState>((set) => ({
    classes: [],
    fetchClasses: async () => {
        try {
            const classes = await api<Class[]>('/api/classes');
            set({ classes: classes || [] });
        } catch (error) {
            console.error("Failed to fetch classes:", error);
            set({ classes: [] });
        }
    },
    createClass: async (newClassData) => {
        const newClass = await api<Class>('/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newClassData),
        });
        set(state => ({ classes: [...state.classes, newClass] }));
        return newClass;
    },
    updateClass: async (classId, updatedData) => {
        const updatedClass = await api<Class>(`/api/classes/${classId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        set(state => ({
            classes: state.classes.map(c => c.id === classId ? updatedClass : c)
        }));
    },
}));
