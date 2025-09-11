'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Assignment, Submission } from '@/lib/types';
import { assignments as initialAssignments, submissions as initialSubmissions } from '@/lib/data';

interface AssignmentsState {
  assignments: Assignment[];
  submissions: Submission[];
  loadAssignments: () => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<Assignment>;
  addSubmission: (submission: Omit<Submission, 'id'>) => Promise<Submission>;
}

export const useAssignments = create<AssignmentsState>()(
  persist(
    (set, get) => ({
      assignments: [],
      submissions: [],
      loadAssignments: async () => {
        // In a real app, this would be an API call.
        // For now, we'll check if localStorage is already seeded.
        if (get().assignments.length === 0) {
            set({ assignments: initialAssignments, submissions: initialSubmissions });
        }
      },
      addAssignment: async (assignment) => {
        const newAssignment: Assignment = {
            ...assignment,
            id: `assignment-${Date.now()}`
        };
        set(state => ({ assignments: [...state.assignments, newAssignment] }));
        return newAssignment;
      },
      addSubmission: async (submission) => {
        const newSubmission: Submission = {
            ...submission,
            id: `sub-${Date.now()}`
        };
        set(state => ({ submissions: [...state.submissions, newSubmission] }));
        return newSubmission;
      }
    }),
    {
      name: 'assignments-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
