
import type { User, Student, Teacher, Class, Assignment, Submission } from './types';
import { teachers, students as initialStudents, classes as initialClasses, assignments as initialAssignments, submissions as initialSubmissions } from './data';

const IS_SERVER = typeof window === 'undefined';

class LocalStorageStore {
    private data: { [key: string]: any } = {};

    constructor() {
        if (IS_SERVER) return;

        // Initialize with default data if storage is empty
        this.init('users', [...teachers, ...initialStudents]);
        this.init('classes', initialClasses);
        this.init('assignments', initialAssignments);
        this.init('submissions', initialSubmissions);
    }

    private init(key: string, defaultData: any[]) {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(defaultData));
        }
    }

    public read<T>(key: string): T[] {
        if (IS_SERVER) {
            // In a server context, return in-memory data or connect to a real DB
            // For this simulation, we'll just return the initial data.
            if (key === 'users') return [...teachers, ...initialStudents] as T[];
            if (key === 'classes') return initialClasses as T[];
            if (key === 'assignments') return initialAssignments as T[];
            if (key === 'submissions') return initialSubmissions as T[];
            return [];
        }
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    public write<T>(key: string, data: T[]): void {
        if (IS_SERVER) {
            // Handle server-side storage if necessary
            return;
        }
        localStorage.setItem(key, JSON.stringify(data));
    }
}

export const db = new LocalStorageStore();
