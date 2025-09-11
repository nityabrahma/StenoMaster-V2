'use client';
import { create } from 'zustand';
import { assignments, classes, students, submissions } from '@/lib/data';
import type { Assignment, Class, Submission, User } from '@/lib/types';

interface ScoreState {
  assignments: Assignment[];
  classes: Class[];
  students: User[];
  scores: Submission[];
  loading: boolean;
  fetchAssignments: (classId?: string) => Promise<void>;
  fetchClasses: (user: User | null) => Promise<Class[]>;
  fetchClassesForTeacher: (user: User | null) => Promise<Class[]>;
  fetchStudentsInClass: (classId: string) => Promise<User[]>;
  fetchScoresForTeacher: (user: User | null) => Promise<void>;
  fetchScores: (studentId: string) => Promise<void>;
  setAssignments: (assignments: Assignment[]) => void;
}

export const useScore = create<ScoreState>((set, get) => ({
  assignments: [],
  classes: [],
  students: [],
  scores: [],
  loading: false,

  setAssignments: (newAssignments) => {
    set({ assignments: newAssignments });
  },

  fetchAssignments: async (classId?: string) => {
    set({ loading: true });
    // Simulate API call
    await new Promise(res => setTimeout(res, 300));
    let fetchedAssignments = assignments;
    if (classId) {
        fetchedAssignments = assignments.filter(a => a.classId === classId);
    }
    set({ assignments: fetchedAssignments, loading: false });
  },

  fetchClasses: async (user: User | null) => {
    set({ loading: true });
    await new Promise(res => setTimeout(res, 300));
    if (!user) {
        set({ classes: [], loading: false });
        return [];
    }
    const studentUser = students.find(s => s.id === user.id);
    const fetchedClasses = studentUser ? classes.filter(c => studentUser.classIds.includes(c.id)) : [];
    set({ classes: fetchedClasses, loading: false });
    return fetchedClasses;
  },

  fetchClassesForTeacher: async (user: User | null) => {
    set({ loading: true });
    await new Promise(res => setTimeout(res, 300));
     if (!user || user.role !== 'teacher') {
        set({ classes: [], loading: false });
        return [];
    }
    const teacherClasses = classes.filter(c => c.teacherId === user.id);
    set({ classes: teacherClasses, loading: false });
    return teacherClasses;
  },

  fetchStudentsInClass: async (classId: string) => {
    set({ loading: true });
    await new Promise(res => setTimeout(res, 300));
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) {
        set({ students: [], loading: false });
        return [];
    }
    const classStudents = students.filter(s => targetClass.studentIds.includes(s.id));
    set(state => ({ students: [...state.students, ...classStudents], loading: false }));
    return classStudents;
  },

  fetchScoresForTeacher: async (user: User | null) => {
    set({ loading: true });
    await new Promise(res => setTimeout(res, 300));
    if (!user || user.role !== 'teacher') {
        set({ scores: [], loading: false });
        return;
    }
    const teacherClasses = classes.filter(c => c.teacherId === user.id);
    const studentIdsInTeacherClasses = new Set(teacherClasses.flatMap(c => c.studentIds));
    const teacherScores = submissions.filter(s => studentIdsInTeacherClasses.has(s.studentId));
    set({ scores: teacherScores, loading: false });
  },

  fetchScores: async (studentId: string) => {
    set({ loading: true });
    await new Promise(res => setTimeout(res, 300));
    const studentScores = submissions.filter(s => s.studentId === studentId);
    set(state => ({
      scores: [...state.scores.filter(s => s.studentId !== studentId), ...studentScores],
      loading: false,
    }));
  },
}));
