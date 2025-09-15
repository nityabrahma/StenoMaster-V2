
'use client';
import { create } from 'zustand';
import type { Student } from '@/lib/types';

interface StudentsState {
  students: Student[];
  fetchStudents: () => Promise<void>;
  updateStudent: (studentId: string, updatedData: Partial<Omit<Student, 'id'>>) => Promise<void>;
  removeStudent: (studentId: string) => Promise<void>;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `API Error: ${res.status}`);
    }
    return res.json();
}

export const useStudents = create<StudentsState>((set) => ({
    students: [],
    fetchStudents: async () => {
        try {
            const students = await api<Student[]>('/api/students');
            set({ students });
        } catch (error) {
            console.error("Failed to fetch students:", error);
            set({ students: [] });
        }
    },
    updateStudent: async (studentId, updatedData) => {
        const updatedStudent = await api<Student>(`/api/students/${studentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        set(state => ({
            students: state.students.map(s => s.id === studentId ? updatedStudent : s)
        }));
    },
    removeStudent: async (studentId) => {
        await api(`/api/students/${studentId}`, { method: 'DELETE' });
        set(state => ({
            students: state.students.filter(s => s.id !== studentId),
        }));
    },
}));
