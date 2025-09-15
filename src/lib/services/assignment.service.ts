
import { db } from '@/lib/data-store';
import type { Assignment } from '@/lib/types';

export async function getAllAssignments(): Promise<Assignment[]> {
    return new Promise(resolve => resolve(db.read<Assignment>('assignments')));
}

export async function getAssignmentById(id: string): Promise<Assignment | undefined> {
    const assignments = await getAllAssignments();
    return new Promise(resolve => resolve(assignments.find(a => a.id === id)));
}

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const assignments = await getAllAssignments();
    const newAssignment: Assignment = {
        ...data,
        id: `assignment-${Date.now()}`,
    };
    db.write('assignments', [...assignments, newAssignment]);
    return new Promise(resolve => resolve(newAssignment));
}

export async function deleteAssignment(id: string): Promise<void> {
    let assignments = await getAllAssignments();
    const initialLength = assignments.length;
    assignments = assignments.filter(a => a.id !== id);
    if (assignments.length === initialLength) {
        throw new Error('Assignment not found');
    }
    db.write('assignments', assignments);
    return new Promise(resolve => resolve());
}
