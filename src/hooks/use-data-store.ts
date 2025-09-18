
'use client';
import { create } from 'zustand';
import type { Assignment, Score } from '@/lib/types';

type NewAssignment = Omit<Assignment, 'id'>;
type NewScore = Omit<Score, 'id' | 'studentId'>;

interface DataStoreState {
  assignments: Assignment[];
  scores: Score[];
  fetchAssignments: () => Promise<void>;
  createAssignment: (assignment: NewAssignment) => Promise<Assignment>;
  updateAssignment: (id: string, data: Partial<NewAssignment>) => Promise<void>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
  fetchScores: () => Promise<void>;
  createScore: (score: NewScore) => Promise<Score>;
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

export const useDataStore = create<DataStoreState>((set, get) => ({
    assignments: [],
    scores: [],
    fetchAssignments: async () => {
        try {
            const assignments = await api<Assignment[]>('/api/assignments');
            set({ assignments: assignments || [] });
        } catch (error) {
            console.error("Failed to fetch assignments:", error);
            set({ assignments: [] });
        }
    },
    createAssignment: async (assignmentData) => {
        const newAssignment = await api<Assignment>('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignmentData),
        });
        set(state => ({ assignments: [...state.assignments, newAssignment] }));
        return newAssignment;
    },
    updateAssignment: async (id, data) => {
        const updatedAssignment = await api<Assignment>(`/api/assignments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        set(state => ({
            assignments: state.assignments.map(a => a.id === id ? updatedAssignment : a)
        }));
    },
    deleteAssignment: async (assignmentId) => {
        await api(`/api/assignments/${assignmentId}`, { method: 'DELETE' });
        set(state => ({
            assignments: state.assignments.filter(a => a.id !== assignmentId),
        }));
    },
    fetchScores: async () => {
        try {
            const scores = await api<Score[]>('/api/scores');
            set({ scores: scores || [] });
        } catch (error) {
            console.error("Failed to fetch scores:", error);
            set({ scores: [] });
        }
    },
    createScore: async (scoreData) => {
        const newScore = await api<Score>('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData),
        });
        set(state => ({
            scores: [
                newScore,
                ...state.scores.filter(s => !(s.assignmentId === newScore.assignmentId && s.studentId === newScore.studentId))
            ]
        }));
        return newScore;
    },
}));
