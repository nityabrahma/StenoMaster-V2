
import { db } from '@/lib/data-store';
import type { Student } from '@/lib/types';

export async function getAllStudents(): Promise<Student[]> {
    const allUsers = db.read<any>('users');
    const students = allUsers.filter(u => u.role === 'student');
    return new Promise(resolve => resolve(students));
}

export async function updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student> {
    const users = db.read<any>('users');
    const studentIndex = users.findIndex(s => s.id === id && s.role === 'student');

    if (studentIndex === -1) {
        throw new Error('Student not found');
    }

    const updatedStudent = { ...users[studentIndex], ...data };
    users[studentIndex] = updatedStudent;
    db.write('users', users);

    return new Promise(resolve => resolve(updatedStudent));
}

export async function deleteStudent(id: string): Promise<void> {
    let users = db.read<any>('users');
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);

    if (users.length === initialLength) {
        throw new Error('Student not found');
    }
    db.write('users', users);

    // Also remove student from any classes they were in
    const classes = db.read<any>('classes');
    const updatedClasses = classes.map(c => ({
        ...c,
        studentIds: c.studentIds.filter((studentId: string) => studentId !== id)
    }));
    db.write('classes', updatedClasses);
    
    return new Promise(resolve => resolve());
}
