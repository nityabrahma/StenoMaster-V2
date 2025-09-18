
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import type { Score } from '@/lib/types';
import { getStudentsByTeacher } from './student.service';

const scoresCollection = db.collection('scores');

function mapDocToScore(doc: QueryDocumentSnapshot | DocumentData): Score {
    const data = doc.data();

    let completedAt: string;
    if (data.completedAt && typeof data.completedAt.toDate === 'function') { 
        completedAt = data.completedAt.toDate().toISOString();
    } else if (data.completedAt && typeof data.completedAt === 'string') {
        const d = new Date(data.completedAt);
        if(!isNaN(d.getTime())) {
            completedAt = d.toISOString();
        } else {
            completedAt = new Date().toISOString();
        }
    } else {
        completedAt = new Date().toISOString();
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

export async function getScoresByStudent(studentId: string): Promise<Score[]> {
    const snapshot = await scoresCollection.where('studentId', '==', studentId).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToScore);
}

export async function getScoresByTeacher(teacherId: string, limit?: number): Promise<Score[]> {
    const students = await getStudentsByTeacher(teacherId);
    if (students.length === 0) {
        return [];
    }

    const studentIds = students.map(s => s.id);
    
    let query = scoresCollection.where('studentId', 'in', studentIds);
    
    // Note: We are not sorting by date here to avoid needing a composite index.
    // Sorting should be done on the client if needed.

    if (limit) {
        query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
        return [];
    }

    const scores = snapshot.docs.map(mapDocToScore);
    
    // If a limit was applied, it's efficient to sort on the server after fetching.
    if (limit) {
        return scores.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }

    return scores;
}


export async function createScore(data: Omit<Score, 'id'>): Promise<Score> {
    // Overwrite any previous score for the same assignment by the same student.
    const query = scoresCollection
        .where('assignmentId', '==', data.assignmentId)
        .where('studentId', '==', data.studentId);
    
    const existing = await query.get();

    if (!existing.empty) {
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
