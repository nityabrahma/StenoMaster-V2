
import { assignments as initialAssignments } from '@/lib/data';
import type { Assignment } from '@/lib/types';

// Let's use the in-memory array for this service
const assignments: Assignment[] = [...initialAssignments];

export async function getAllAssignments(): Promise<Assignment[]> {
    return new Promise(resolve => resolve(assignments));
}

export async function getAssignmentById(id: string): Promise<Assignment | undefined> {
    const allAssignments = await getAllAssignments();
    return new Promise(resolve => resolve(allAssignments.find(a => a.id === id)));
}

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const newAssignment: Assignment = {
        ...data,
        id: `assignment-${Date.now()}`,
    };
    assignments.push(newAssignment);
    return new Promise(resolve => resolve(newAssignment));
}

export async function deleteAssignment(id: string): Promise<void> {
    const initialLength = assignments.length;
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) {
        throw new Error('Assignment not found');
    }
    assignments.splice(index, 1);
    return new Promise(resolve => resolve());
}
