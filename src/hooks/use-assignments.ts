
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Assignment, Submission } from '@/lib/types';
import { assignments as initialAssignments, submissions as initialSubmissions } from '@/lib/data';

type NewSubmission = Omit<Submission, 'id'>;

interface AssignmentsState {
  assignments: Assignment[];
  submissions: Submission[];
  setAssignments: (assignments: Assignment[]) => void;
  setSubmissions: (submissions: Submission[]) => void;
  loadAssignments: () => Promise<void>;
  addAssignment: (assignment: Assignment) => void;
  addSubmission: (submission: Submission) => void;
  deleteAssignment: (assignmentId: string) => void;
}

export const useAssignments = create<AssignmentsState>()(
  persist(
    (set, get) => ({
      assignments: [],
      submissions: [],
      setAssignments: (assignments) => set({ assignments }),
      setSubmissions: (submissions) => set({ submissions }),
      loadAssignments: async () => {
        // This function is now a no-op but is kept for potential future use,
        // for example, loading data from an API.
        // The persisted state will be loaded automatically by zustand middleware.
      },
      addAssignment: (assignment) => {
        set(state => ({ assignments: [...state.assignments, assignment] }));
      },
      addSubmission: (submission) => {
        // Remove any previous submission for the same assignment by the same student
        const otherSubmissions = get().submissions.filter(s => 
            !(s.assignmentId === submission.assignmentId && s.studentId === submission.studentId)
        );
        set({ submissions: [submission, ...otherSubmissions] });
      },
      deleteAssignment: async (assignmentId: string) => {
        set(state => ({
            assignments: state.assignments.filter(a => a.id !== assignmentId)
        }));
      }
    }),
    {
      name: 'assignments-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
