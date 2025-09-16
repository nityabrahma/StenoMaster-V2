
import { db } from '@/lib/firebase-admin';
import type { Assignment } from '@/lib/types';
import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

const assignmentsCollection = db.collection('assignments');

function mapDocToAssignment(doc: QueryDocumentSnapshot | DocumentData): Assignment {
    const data = doc.data();
    // Safely handle deadline conversion
    let deadline: string;
    if (data.deadline && typeof data.deadline.toDate === 'function') { // Check if it's a Firestore Timestamp
        deadline = data.deadline.toDate().toISOString();
    } else if (typeof data.deadline === 'string') {
        deadline = data.deadline;
    } else {
        deadline = new Date().toISOString(); // Fallback
    }

    return {
        id: doc.id,
        title: data.title || 'Untitled',
        classId: data.classId || '',
        deadline: deadline,
        text: data.text || data.correctText || '', // Map correctText to text
        imageUrl: data.imageUrl,
    };
}


export async function getAllAssignments(): Promise<Assignment[]> {
    const snapshot = await assignmentsCollection.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToAssignment);
}

export async function getAssignmentById(id: string): Promise<Assignment | undefined> {
    const doc = await assignmentsCollection.doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    return mapDocToAssignment(doc);
}

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const docRef = await assignmentsCollection.add({
        ...data,
        deadline: new Date(data.deadline) // Store as a proper date
    });
    return { ...data, id: docRef.id };
}

export async function deleteAssignment(id: string): Promise<void> {
    await assignmentsCollection.doc(id).delete();
}
