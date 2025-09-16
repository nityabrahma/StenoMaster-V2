
import { db } from '../firebase-admin';
import type { Submission } from '@/lib/types';

const submissionsCollection = db.collection('submissions');

export async function getAllSubmissions(): Promise<Submission[]> {
    const snapshot = await submissionsCollection.orderBy('submittedAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
}

export async function createSubmission(data: Omit<Submission, 'id'>): Promise<Submission> {
    const query = submissionsCollection
        .where('assignmentId', '==', data.assignmentId)
        .where('studentId', '==', data.studentId);
    
    const existing = await query.get();

    if (!existing.empty) {
        // A submission for this assignment by this student already exists.
        // Firestore doesn't have a great "upsert" so we delete the old one and add the new one.
        const batch = db.batch();
        existing.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
    
    const docRef = await submissionsCollection.add(data);
    return { ...data, id: docRef.id };
}
