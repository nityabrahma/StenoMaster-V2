
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Assignment, Submission } from '@/lib/types';
import { assignments as initialAssignments, submissions as initialSubmissions } from '@/lib/data';

type NewSubmission = Omit<Submission, 'id'>;

interface AssignmentsState {
  assignments: Assignment[];
  submissions: Submission[];
  loadAssignments: () => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<Assignment>;
  addSubmission: (submission: NewSubmission) => Promise<Submission>;
}

export const useAssignments = create<AssignmentsState>()(
  persist(
    (set, get) => ({
      assignments: [],
      submissions: [],
      loadAssignments: async () => {
        // This function is now a no-op but is kept for potential future use,
        // for example, loading data from an API.
        // The persisted state will be loaded automatically by zustand middleware.
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
        // Remove any previous submission for the same assignment by the same student
        const otherSubmissions = get().submissions.filter(s => 
            !(s.assignmentId === newSubmission.assignmentId && s.studentId === newSubmission.studentId)
        );
        set({ submissions: [newSubmission, ...otherSubmissions] });
        return newSubmission;
      }
    }),
    {
      name: 'assignments-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
