
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import type { Submission } from '@/lib/types';

const submissionsCollection = db.collection('submissions');

function mapDocToSubmission(doc: QueryDocumentSnapshot | DocumentData): Submission {
    const data = doc.data();

    let submittedAt: string;
    if (data.submittedAt && typeof data.submittedAt.toDate === 'function') { 
        submittedAt = data.submittedAt.toDate().toISOString();
    } else if (typeof data.submittedAt === 'string' && data.submittedAt) {
        submittedAt = new Date(data.submittedAt).toISOString();
    } else {
        submittedAt = new Date().toISOString(); // Fallback to a valid date
    }

    return {
        id: doc.id,
        assignmentId: data.assignmentId || '',
        studentId: data.studentId || '',
        submittedAt: submittedAt,
        wpm: data.wpm || 0,
        accuracy: data.accuracy || 0,
        mistakes: data.mistakes || 0,
        userInput: data.userInput || '',
    };
}

export async function getAllSubmissions(): Promise<Submission[]> {
    const snapshot = await submissionsCollection.orderBy('submittedAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToSubmission);
}

export async function createSubmission(data: Omit<Submission, 'id'>): Promise<Submission> {
    const query = submissionsCollection
        .where('assignmentId', '==', data.assignmentId)
        .where('studentId', '==', data.studentId);
    
    const existing = await query.get();

    if (!existing.empty) {
        const batch = db.batch();
        existing.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
    
    const submissionPayload = {
        ...data,
        submittedAt: new Date(data.submittedAt)
    }

    const docRef = await submissionsCollection.add(submissionPayload);
    const newDoc = await docRef.get();
    return mapDocToSubmission(newDoc);
}
