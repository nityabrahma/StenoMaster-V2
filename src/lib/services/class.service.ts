
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import type { Class } from '@/lib/types';

const classesCollection = db.collection('classes');

function mapDocToClass(doc: QueryDocumentSnapshot | DocumentData): Class {
    const data = doc.data();
    
    let createdAt: string;
    if (data.createdAt && typeof data.createdAt.toDate === 'function') { 
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt === 'string' && data.createdAt) {
        createdAt = new Date(data.createdAt).toISOString();
    } else {
        createdAt = new Date().toISOString(); // Fallback to a valid date
    }

    return {
      id: doc.id,
      name: data.name || 'Unnamed Class',
      teacherId: data.teacherId || '',
      studentIds: data.studentIds || data.students || [],
      createdAt: createdAt,
    };
}

export async function getAllClasses(): Promise<Class[]> {
    const snapshot = await classesCollection.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToClass);
}

export async function createClass(data: Omit<Class, 'id' | 'createdAt'>): Promise<Class> {
    const payload = {
        ...data,
        createdAt: new Date(),
    }
    const docRef = await classesCollection.add(payload);
    const newDoc = await docRef.get();
    return mapDocToClass(newDoc);
}

export async function updateClass(id: string, data: Partial<Omit<Class, 'id'>>): Promise<Class> {
    const docRef = classesCollection.doc(id);
    await docRef.update(data);
    const updatedDoc = await docRef.get();
    if (!updatedDoc.exists) {
        throw new Error('Class not found after update');
    }
    return mapDocToClass(updatedDoc);
}

export async function getClassesByStudentId(studentId: string): Promise<Class[]> {
    const snapshot = await classesCollection.where('studentIds', 'array-contains', studentId).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToClass);
}
