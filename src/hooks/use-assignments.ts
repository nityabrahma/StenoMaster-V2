
'use client';
import { create } from 'zustand';
import type { Assignment, Submission } from '@/lib/types';

type NewAssignment = Omit<Assignment, 'id'>;
type NewSubmission = Omit<Submission, 'id' | 'studentId'>;

interface AssignmentsState {
  assignments: Assignment[];
  submissions: Submission[];
  fetchAssignments: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  createAssignment: (assignment: NewAssignment) => Promise<Assignment>;
  createSubmission: (submission: NewSubmission) => Promise<Submission>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `API Error: ${res.status}`);
    }
    return res.json();
}

export const useAssignments = create<AssignmentsState>((set, get) => ({
    assignments: [],
    submissions: [],
    fetchAssignments: async () => {
        try {
            const assignments = await api<Assignment[]>('/api/assignments');
            const submissions = await api<Submission[]>('/api/submissions');
            set({ assignments, submissions });
        } catch (error) {
            console.error("Failed to fetch assignments or submissions:", error);
            set({ assignments: [], submissions: [] });
        }
    },
    fetchSubmissions: async () => {
        // This is combined with fetchAssignments, but can be separate if needed
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
    createSubmission: async (submissionData) => {
        const newSubmission = await api<Submission>('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });
        set(state => ({
            submissions: [
                newSubmission, 
                ...state.submissions.filter(s => !(s.assignmentId === newSubmission.assignmentId && s.studentId === newSubmission.studentId))
            ]
        }));
        return newSubmission;
    },
    deleteAssignment: async (assignmentId) => {
        await api(`/api/assignments/${assignmentId}`, { method: 'DELETE' });
        set(state => ({
            assignments: state.assignments.filter(a => a.id !== assignmentId),
        }));
    },
}));
