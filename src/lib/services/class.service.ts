
import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import type { Class } from '@/lib/types';

const classesCollection = db.collection('classes');

function mapDocToClass(doc: QueryDocumentSnapshot | DocumentData): Class {
    const data = doc.data();
    
    let createdAt: string;
    if (data.createdAt && typeof data.createdAt.toDate === 'function') { 
        createdAt = data.createdAt.toDate().toISOString();
    } else if (data.createdAt && typeof data.createdAt === 'string') {
        const d = new Date(data.createdAt);
        if(!isNaN(d.getTime())) {
            createdAt = d.toISOString();
        } else {
            createdAt = new Date().toISOString();
        }
    } else {
        createdAt = new Date().toISOString();
    }

    return {
      id: doc.id,
      name: data.name || 'Unnamed Class',
      teacherId: data.teacherId || '',
      students: data.students || data.studentIds || [],
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

export async function getClassesByTeacher(teacherId: string): Promise<Class[]> {
    const snapshot = await classesCollection.where('teacherId', '==', teacherId).get();
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
    const snapshot = await classesCollection.where('students', 'array-contains', studentId).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToClass);
}

export async function deleteClass(classId: string): Promise<void> {
    const docRef = classesCollection.doc(classId);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error('Class not found');
    }
    await docRef.delete();
}
