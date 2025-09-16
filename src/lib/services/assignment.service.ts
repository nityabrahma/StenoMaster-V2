
import { db } from '../firebase-admin';
import type { Assignment } from '@/lib/types';

const assignmentsCollection = db.collection('assignments');

export async function getAllAssignments(): Promise<Assignment[]> {
    const snapshot = await assignmentsCollection.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
}

export async function getAssignmentById(id: string): Promise<Assignment | undefined> {
    const doc = await assignmentsCollection.doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    return { id: doc.id, ...doc.data() } as Assignment;
}

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const docRef = await assignmentsCollection.add(data);
    return { ...data, id: docRef.id };
}

export async function deleteAssignment(id: string): Promise<void> {
    await assignmentsCollection.doc(id).delete();
}
