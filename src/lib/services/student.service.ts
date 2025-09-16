
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import type { Student } from '@/lib/types';
import { getAllClasses } from './class.service';

const usersCollection = db.collection('users');

function mapDocToStudent(doc: QueryDocumentSnapshot | DocumentData): Student {
    const data = doc.data();
    return {
      id: doc.id, // Firestore doc ID
      name: data.name || 'Unnamed Student',
      email: data.email || '',
      role: 'student',
      classIds: data.classIds || [],
    };
}

export async function getAllStudents(): Promise<Student[]> {
    const snapshot = await usersCollection.where('role', '==', 'student').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(mapDocToStudent);
}


export async function getStudentsByTeacher(teacherId: string): Promise<Student[]> {
    const allClasses = await getAllClasses();
    const teacherClasses = allClasses.filter(c => c.teacherId === teacherId);
    const studentIds = new Set(teacherClasses.flatMap(c => c.studentIds));

    if (studentIds.size === 0) {
        return [];
    }

    const students: Student[] = [];
    // Firestore 'in' query is limited to 30 elements. We may need to batch.
    const studentIdChunks: string[][] = [];
    const allStudentIds = Array.from(studentIds);
    for (let i = 0; i < allStudentIds.length; i += 30) {
        studentIdChunks.push(allStudentIds.slice(i, i + 30));
    }

    for (const chunk of studentIdChunks) {
        if (chunk.length > 0) {
            const snapshot = await db.collection('users').where('__name__', 'in', chunk).get();
            snapshot.forEach(doc => {
                 students.push(mapDocToStudent(doc));
            });
        }
    }
    
    return students;
}


export async function updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student> {
    const docRef = usersCollection.doc(id);
    await docRef.update(data);
    const updatedDoc = await docRef.get();
     if (!updatedDoc.exists) {
        throw new Error('Student not found after update');
    }
    return mapDocToStudent(updatedDoc);
}

export async function deleteStudent(id: string): Promise<void> {
    const docRef = usersCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error('Student not found');
    }
    await docRef.delete();
}
