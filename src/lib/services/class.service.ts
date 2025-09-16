
import { db } from '@/lib/firebase-admin';
import type { Class } from '@/lib/types';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';


const classesCollection = db.collection('classes');

function mapDocToClass(doc: QueryDocumentSnapshot | DocumentData): Class {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || 'Unnamed Class',
      teacherId: data.teacherId || '',
      studentIds: data.studentIds || data.students || [], // Map old 'students' field
    };
}

export async function getAllClasses(): Promise<Class[]> {
    const snapshot = await classesCollection.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToClass);
}

export async function createClass(data: Omit<Class, 'id'>): Promise<Class> {
    const docRef = await classesCollection.add(data);
    return {
        ...data,
        id: docRef.id,
    };
}

export async function updateClass(id: string, data: Partial<Omit<Class, 'id'>>): Promise<Class> {
    const docRef = classesCollection.doc(id);
    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return mapDocToClass(updatedDoc);
}
