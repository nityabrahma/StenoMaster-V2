import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import type { Assignment } from '@/lib/types';
import { deleteScoresByAssignment } from './score.service';

const assignmentsCollection = db.collection('assignments');

function mapDocToAssignment(doc: QueryDocumentSnapshot | DocumentData): Assignment {
    const data = doc.data();
    
    let deadline: string;
    if (data.deadline && typeof data.deadline.toDate === 'function') { 
        deadline = data.deadline.toDate().toISOString();
    } else if (data.deadline && typeof data.deadline === 'string') {
        const d = new Date(data.deadline);
        // Check if the date is valid
        if (!isNaN(d.getTime())) {
            deadline = d.toISOString();
        } else {
            deadline = new Date().toISOString(); // Fallback for invalid string
        }
    } else {
        deadline = new Date().toISOString(); // Fallback for null, undefined, or other types
    }

    return {
        id: doc.id,
        title: data.title || 'Untitled',
        classId: data.classId || '',
        deadline: deadline,
        text: data.text || data.correctText || '',
        imageUrl: data.imageUrl || '',
        isActive: data.isActive === undefined ? true : data.isActive,
    };
}


export async function getAllAssignments(): Promise<Assignment[]> {
    const snapshot = await assignmentsCollection.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToAssignment);
}

export async function getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    const snapshot = await assignmentsCollection.where('teacherId', '==', teacherId).get();
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
        deadline: new Date(data.deadline)
    });
    const newDoc = await docRef.get();
    return mapDocToAssignment(newDoc);
}

export async function updateAssignment(id: string, data: Partial<Omit<Assignment, 'id'>>): Promise<Assignment> {
    const docRef = assignmentsCollection.doc(id);
    const updatePayload: any = { ...data };

    if (data.deadline) {
        updatePayload.deadline = new Date(data.deadline);
    }
    
    await docRef.update(updatePayload);
    const updatedDoc = await docRef.get();
    if (!updatedDoc.exists) {
        throw new Error('Assignment not found after update');
    }
    return mapDocToAssignment(updatedDoc);
}

export async function deleteAssignment(id: string): Promise<void> {
    const docRef = assignmentsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error('Assignment not found');
    }
    
    // Delete associated scores first
    await deleteScoresByAssignment(id);

    // Then delete the assignment
    await docRef.delete();
}
