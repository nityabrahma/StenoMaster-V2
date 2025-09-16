
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import type { Assignment } from '@/lib/types';

const assignmentsCollection = db.collection('assignments');

function mapDocToAssignment(doc: QueryDocumentSnapshot | DocumentData): Assignment {
    const data = doc.data();
    
    let deadline: string;
    if (data.deadline && typeof data.deadline.toDate === 'function') { 
        deadline = data.deadline.toDate().toISOString();
    } else if (typeof data.deadline === 'string' && data.deadline) {
        deadline = new Date(data.deadline).toISOString();
    } else {
        deadline = new Date().toISOString(); // Fallback to a valid date
    }

    return {
        id: doc.id,
        title: data.title || 'Untitled',
        classId: data.classId || '',
        deadline: deadline,
        text: data.text || data.correctText || '', // Map correctText to text
        imageUrl: data.imageUrl || '',
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
    const newDoc = await docRef.get();
    return mapDocToAssignment(newDoc);
}

export async function deleteAssignment(id: string): Promise<void> {
    const docRef = assignmentsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error('Assignment not found');
    }
    await docRef.delete();
}
