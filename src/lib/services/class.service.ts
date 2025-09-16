
import { db } from '../firebase-admin';
import type { Class } from '@/lib/types';

const classesCollection = db.collection('classes');

export async function getAllClasses(): Promise<Class[]> {
    const snapshot = await classesCollection.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
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
    return { id, ...updatedDoc.data() } as Class;
}
