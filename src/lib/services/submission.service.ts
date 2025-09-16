import { db } from '@/lib/database/firebase-admin';
import type { Submission } from '@/lib/types';
import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

const submissionsCollection = db.collection('submissions');

function mapDocToSubmission(doc: QueryDocumentSnapshot | DocumentData): Submission {
    const data = doc.data();

    // Safely handle timestamp conversion
    let submittedAt: string;
    if (data.submittedAt instanceof Timestamp) {
        submittedAt = data.submittedAt.toDate().toISOString();
    } else if (typeof data.submittedAt === 'string') {
        submittedAt = data.submittedAt;
    } else {
        submittedAt = new Date().toISOString(); // Fallback
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
    
    // Store dates as proper Timestamps
    const submissionPayload = {
        ...data,
        submittedAt: new Date(data.submittedAt)
    }

    const docRef = await submissionsCollection.add(submissionPayload);
    
    return { ...data, id: docRef.id };
}
