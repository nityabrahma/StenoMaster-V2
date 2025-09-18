
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import type { Score } from '@/lib/types';

const scoresCollection = db.collection('scores');

function mapDocToScore(doc: QueryDocumentSnapshot | DocumentData): Score {
    const data = doc.data();

    let completedAt: string;
    if (data.completedAt && typeof data.completedAt.toDate === 'function') { 
        completedAt = data.completedAt.toDate().toISOString();
    } else if (typeof data.completedAt === 'string' && data.completedAt) {
        completedAt = new Date(data.completedAt).toISOString();
    } else {
        completedAt = new Date().toISOString(); // Fallback to a valid date
    }

    return {
        id: doc.id,
        assignmentId: data.assignmentId || '',
        studentId: data.studentId || '',
        completedAt: completedAt,
        wpm: data.wpm || 0,
        accuracy: data.accuracy || 0,
        mistakes: data.mistakes || [],
        userInput: data.userInput || data.typedText || '',
        timeElapsed: data.timeElapsed || 0,
    };
}

export async function getAllScores(): Promise<Score[]> {
    const snapshot = await scoresCollection.orderBy('completedAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToScore);
}

export async function createScore(data: Omit<Score, 'id'>): Promise<Score> {
    // Check if a score for this assignment by this student already exists.
    // If so, overwrite it. This is useful for practice tests.
    const query = scoresCollection
        .where('assignmentId', '==', data.assignmentId)
        .where('studentId', '==', data.studentId);
    
    const existing = await query.get();

    if (!existing.empty) {
        // Delete existing scores for this assignment/student pair.
        const batch = db.batch();
        existing.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
    
    const scorePayload = {
        ...data,
        completedAt: new Date(data.completedAt)
    }

    const docRef = await scoresCollection.add(scorePayload);
    const newDoc = await docRef.get();
    return mapDocToScore(newDoc);
}
